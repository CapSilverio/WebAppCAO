document.addEventListener('DOMContentLoaded', function() {
    const rankingList = document.getElementById('ranking-list');
    const eletivasContainer = document.getElementById('eletivas-cards-container');
    const turnAnnouncement = document.getElementById('turn-announcement');
    const notificationSound = document.getElementById('notification-sound');
    let currentUser = null;
    let currentTurn = -1;
    let bannerTimeout;

    async function fetchStatus() {
        try {
            const response = await fetch('/api/eletivas/status');
            if (!response.ok) {
                throw new Error('Não foi possível obter o estado atual das eletivas.');
            }
            const data = await response.json();
            
            if (currentTurn !== -1 && data.current_turn_info && currentTurn !== data.current_turn_info.ordem) {
                notificationSound.play().catch(e => console.error("Erro ao tocar som:", e));
            }
            
            currentUser = data.current_user;
            currentTurn = data.current_turn_info ? data.current_turn_info.ordem : -1;

            updateRankingList(data.classification, data.current_turn_info);
            updateEletivasList(data.eletivas, data.current_turn_info, data.current_user);
            updateTurnAnnouncement(data.current_turn_info, data.current_user);

        } catch (error) {
            console.error('Erro ao buscar status:', error);
            turnAnnouncement.textContent = error.message;
            turnAnnouncement.className = 'floating-status-banner alert-danger show';
        }
    }

    function updateRankingList(classification, currentTurnInfo) {
        rankingList.innerHTML = '';
        classification.forEach(person => {
            const li = document.createElement('li');
            // Usa list-group-item-dark para combinar com o card text-bg-dark
            li.className = 'list-group-item list-group-item-dark'; 
            if (person.ja_escolheu) {
                li.classList.add('chosen');
            }
            if (currentTurnInfo && person.ordem === currentTurnInfo.ordem) {
                li.classList.add('active', 'active-turn');
            }
            li.textContent = `${person.ordem}. ${person.nome_aluno}`;
            if (person.ja_escolheu) {
                li.innerHTML += ' <span class="badge bg-light text-dark ms-2">Escolhido</span>';
            }
            rankingList.appendChild(li);
        });
    }

    function updateEletivasList(eletivas, currentTurnInfo, user) {
        eletivasContainer.innerHTML = '';
        const isMyTurn = currentTurnInfo && user && currentTurnInfo.nome_aluno === user.nome_aluno;

        if (eletivas.length === 0) {
            eletivasContainer.innerHTML = '<p class="text-light">Nenhuma matéria eletiva cadastrada no momento.</p>';
            return;
        }

        eletivas.forEach(eletiva => {
            const isEsgotado = eletiva.vagas <= 0;
            const canChoose = isMyTurn && !isEsgotado;
            
            const card = document.createElement('div');
            card.className = `card eletiva-card ${isEsgotado ? 'esgotado' : ''}`;
            
            card.innerHTML = `
                <div class="card-body d-flex flex-column">
                    <h5 class="card-title">${eletiva.nome_materia}</h5>
                    <p class="card-text mt-auto">Vagas: <strong>${eletiva.vagas}</strong></p>
                    <button class="btn btn-choose" data-eletiva-id="${eletiva.id}" ${canChoose ? '' : 'disabled'}>
                        Escolher
                    </button>
                </div>
                ${isEsgotado ? '<div class="overlay-esgotado">ESGOTADO</div>' : ''}
            `;
            
            eletivasContainer.appendChild(card);
        });
    }

    function updateTurnAnnouncement(currentTurnInfo, user) {
        clearTimeout(bannerTimeout);
        let message = '';
        let bannerClass = 'floating-status-banner';

        if (!currentTurnInfo) {
            message = 'Todas as escolhas foram concluídas!';
            bannerClass += ' alert-success';
        } else if (user && currentTurnInfo.nome_aluno === user.nome_aluno) {
            message = 'É a sua vez de escolher!';
            bannerClass += ' alert-success';
        } else {
            message = `Aguarde sua vez. ${currentTurnInfo.nome_aluno} está escolhendo.`;
            bannerClass += ' alert-warning';
        }

        turnAnnouncement.textContent = message;
        turnAnnouncement.className = bannerClass;

        turnAnnouncement.classList.remove('show');
        void turnAnnouncement.offsetWidth;
        turnAnnouncement.classList.add('show');

        if (user && currentTurnInfo && currentTurnInfo.nome_aluno !== user.nome_aluno) {
            bannerTimeout = setTimeout(() => {
                turnAnnouncement.classList.remove('show');
            }, 5000);
        }
    }

    eletivasContainer.addEventListener('click', async function(event) {
        if (event.target.classList.contains('btn-choose')) {
            const eletivaId = event.target.dataset.eletivaId;
            if (!confirm('Confirma a escolha desta matéria? Esta ação não pode ser desfeita.')) {
                return;
            }

            try {
                const response = await fetch('/api/eletivas/choose', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ eletiva_id: eletivaId })
                });
                const result = await response.json();

                if (!result.success) {
                    throw new Error(result.message || 'Ocorreu um erro ao processar sua escolha.');
                }
                
                alert('Escolha realizada com sucesso!');
                fetchStatus();

            } catch (error) {
                console.error('Erro ao escolher:', error);
                alert(error.message);
            }
        }
    });

    fetchStatus();
    setInterval(fetchStatus, 5000);
});