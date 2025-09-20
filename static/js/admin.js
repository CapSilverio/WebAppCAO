document.addEventListener('DOMContentLoaded', () => {
    const sortableUserList = document.getElementById('sortable-user-list');
    const saveRankingBtn = document.getElementById('save-ranking-btn');
    const resetChoicesBtn = document.getElementById('reset-choices-btn');
    const resetPreLoginBtn = document.getElementById('reset-pre-login-btn');
    const resetEletivasBtn = document.getElementById('reset-eletivas-btn');
    const editVacanciesModal = new bootstrap.Modal(document.getElementById('edit-vacancies-modal'));
    const saveVacanciesBtn = document.getElementById('save-vacancies-btn');
    const unitIdInput = document.getElementById('unit-id-input');
    const vacanciesInput = document.getElementById('vacancies-input');
    const rankingTokenInput = document.getElementById('ranking-token-input');
    const saveTokenBtn = document.getElementById('save-token-btn');

    let map;
    let markers = {};

    // Inicializa o SortableJS
    if (sortableUserList) {
        new Sortable(sortableUserList, {
            animation: 150,
            ghostClass: 'blue-background-class'
        });
    }

    

    // Salva a nova ordem do ranking
    async function saveRanking() {
        if (!sortableUserList) return;
        const userItems = Array.from(sortableUserList.children);
        const newRanking = userItems.map((item, index) => ({
            id: item.dataset.userId,
            rank: index + 1,
            name: item.textContent.split(' - ')[1]
        }));

        try {
            const response = await fetch('/api/update_ranking', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newRanking)
            });
            const data = await response.json();
            if (data.success) {
                alert('Ranking atualizado com sucesso!');
                fetchUsers(); // Recarrega a lista
            } else {
                alert('Falha ao atualizar o ranking.');
            }
        } catch (error) {
            console.error('Erro ao salvar o ranking:', error);
        }
    }

    // Inicializa o mapa
    function initMap() {
        map = L.map('map').setView([-22.9068, -43.1729], 5); // Centro no Rio de Janeiro
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
        }).addTo(map);
        fetchUnits();
    }

    // Carrega as unidades no mapa
    async function fetchUnits() {
        try {
            const response = await fetch('/api/units');
            const units = await response.json();
            units.forEach(unit => {
                const marker = L.marker([unit.lat, unit.lon]).addTo(map)
                    .bindPopup(`<b>${unit.name}</b><br>Vagas: ${unit.vacancies}`)
                    .on('click', () => {
                        unitIdInput.value = unit.id;
                        vacanciesInput.value = unit.vacancies;
                        editVacanciesModal.show();
                    });
                markers[unit.id] = marker;
            });
        } catch (error) {
            console.error('Erro ao carregar unidades:', error);
        }
    }

    // Salva o número de vagas
    async function saveVacancies() {
        const unitId = unitIdInput.value;
        const newVacancies = vacanciesInput.value;

        try {
            const response = await fetch(`/api/units/${unitId}/vacancies`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ vacancies: newVacancies })
            });
            const data = await response.json();
            if (data.success) {
                alert('Vagas atualizadas com sucesso!');
                editVacanciesModal.hide();
                // Atualiza o popup do marcador
                const unit = data.unit;
                markers[unit.id].setPopupContent(`<b>${unit.name}</b><br>Vagas: ${unit.vacancies}`);
            } else {
                alert('Falha ao atualizar as vagas.');
            }
        } catch (error) {
            console.error('Erro ao salvar as vagas:', error);
        }
    }

    // --- Funções de Token ---

    async function fetchRankingToken() {
        if (!rankingTokenInput) return;
        try {
            const response = await fetch('/api/ranking_token');
            const data = await response.json();
            if (response.ok && data.token) {
                rankingTokenInput.value = data.token;
            } else {
                console.error('Falha ao buscar token:', data.message);
            }
        } catch (error) {
            console.error('Erro de rede ao buscar o token do ranking:', error);
        }
    }

    async function saveRankingToken() {
        if (!rankingTokenInput) return;
        const newToken = rankingTokenInput.value;
        try {
            const response = await fetch('/api/ranking_token', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token: newToken })
            });
            const data = await response.json();
            if (data.success) {
                alert('Token salvo com sucesso!');
            } else {
                alert(`Falha ao salvar o token: ${data.message}`);
            }
        } catch (error) {
            console.error('Erro de rede ao salvar o token:', error);
            alert('Ocorreu um erro de rede ao salvar o token.');
        }
    }

    // Event Listeners
    if (saveRankingBtn) {
        saveRankingBtn.addEventListener('click', saveRanking);
    }

    if (resetChoicesBtn) {
        resetChoicesBtn.addEventListener('click', () => {
            if (confirm('Tem certeza que deseja zerar todas as escolhas dos alunos?')) {
                fetch('/api/reset_choices', { method: 'POST' })
                    .then(res => res.json())
                    .then(data => {
                        if (data.success) {
                            alert(data.message);
                        }
                    });
            }
        });
    }

    if (resetPreLoginBtn) {
        resetPreLoginBtn.addEventListener('click', () => {
            if (confirm('Tem certeza que deseja zerar o ranking simulado?')) {
                fetch('/api/reset_pre_login_ranking', { method: 'POST' })
                    .then(res => res.json())
                    .then(data => {
                        if (data.success) {
                            alert(data.message);
                        }
                    });
            }
        });
    }

    if (resetEletivasBtn) {
        resetEletivasBtn.addEventListener('click', () => {
            if (confirm('Tem certeza que deseja zerar TODAS as escolhas de eletivas? Esta ação não pode ser desfeita.')) {
                fetch('/api/eletivas/reset', { method: 'POST' })
                    .then(res => res.json())
                    .then(data => {
                        if (data.success) {
                            alert(data.message);
                        } else {
                            alert(`Falha ao zerar escolhas: ${data.message}`);
                        }
                    })
                    .catch(err => {
                        console.error('Erro ao zerar escolhas de eletivas:', err);
                        alert('Ocorreu um erro de rede.');
                    });
            }
        });
    }

    if (saveVacanciesBtn) {
        saveVacanciesBtn.addEventListener('click', saveVacancies);
    }

    if (saveTokenBtn) {
        saveTokenBtn.addEventListener('click', saveRankingToken);
    }

    // Botão para download do relatório de escolhas de OMs
    const downloadEscolhasCsvBtn = document.getElementById('download-escolhas-csv-btn');
    if (downloadEscolhasCsvBtn) {
        downloadEscolhasCsvBtn.addEventListener('click', async () => {
            try {
                const response = await fetch('/api/escolhas/report/csv');
                if (response.ok) {
                    const blob = await response.blob();
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.style.display = 'none';
                    a.href = url;
                    a.download = 'relatorio_escolhas_om.csv';
                    document.body.appendChild(a);
                    a.click();
                    window.URL.revokeObjectURL(url);
                    document.body.removeChild(a);
                } else {
                    const data = await response.json();
                    alert(data.message || 'Falha ao gerar o relatório.');
                }
            } catch (error) {
                console.error('Erro ao baixar o relatório:', error);
                alert('Ocorreu um erro de rede ao baixar o relatório.');
            }
        });
    }

    // Botão para download do relatório de eletivas
    const downloadEletivasCsvBtn = document.getElementById('download-eletivas-csv-btn');
    if (downloadEletivasCsvBtn) {
        downloadEletivasCsvBtn.addEventListener('click', async () => {
            try {
                const response = await fetch('/api/eletivas/report/csv');
                if (response.ok) {
                    const blob = await response.blob();
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.style.display = 'none';
                    a.href = url;
                    a.download = 'relatorio_escolha_eletivas.csv';
                    document.body.appendChild(a);
                    a.click();
                    window.URL.revokeObjectURL(url);
                    document.body.removeChild(a);
                } else {
                    const data = await response.json();
                    alert(data.message || 'Falha ao gerar o relatório.');
                }
            } catch (error) {
                console.error('Erro ao baixar o relatório:', error);
                alert('Ocorreu um erro de rede ao baixar o relatório.');
            }
        });
    }

    // Inicialização
    initMap();
    fetchRankingToken();
});
