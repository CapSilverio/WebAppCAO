document.addEventListener('DOMContentLoaded', () => {
    // Elementos do DOM
    const userList = document.getElementById('user-list');
    const mapElement = document.getElementById('map');
    const choiceLog = document.getElementById('choice-log');
    const heatmapElement = document.getElementById('heatmap');
    const choiceLogBody = document.getElementById('choice-log-body');
    const notificationSound = document.getElementById('notification-sound');
    const resetViewBtn = document.getElementById('reset-view-btn');

    // Variáveis de estado do mapa
    let map = null;
    let heatmap = null;
    let heatLayer = null;
    let commandMarkers = L.layerGroup();
    let unitMarkers = L.layerGroup();
    let allUnidades = [];
    let activeCommandName = null;
    let statusBanner = null; // Será criado dinamicamente

    // Dados estáticos dos comandos militares
    const militaryCommands = {
        'CMA': { lat: -3.4653, lon: -62.2159, name: 'Comando Militar da Amazônia', unidades: [1, 2, 3, 4] },
        'CMN': { lat: -1.4558, lon: -48.5044, name: 'Comando Militar do Norte', unidades: [5, 6] },
        'CMNE': { lat: -8.0578, lon: -34.8829, name: 'Comando Militar do Nordeste', unidades: [7, 8, 9, 10, 11, 12] },
        'CML': { lat: -22.9068, lon: -40.0, name: 'Comando Militar do Leste', unidades: [13, 15, 16, 34, 35, 36] },
        'CMP': { lat: -14.0, lon: -47.8825, name: 'Comando Militar do Planalto', unidades: [14, 30, 39] },
        'CMSE': { lat: -22.9186, lon: -50.3480, name: 'Comando Militar do Sudeste', unidades: [17, 18, 19, 37] },
        'CMS': { lat: -31.8813, lon: -52.8032, name: 'Comando Militar do Sul', unidades: [20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 38] },
        'CMO': { lat: -15.9800, lon: -60.1653, name: 'Comando Militar do Oeste', unidades: [31, 32, 33] }
    };

    // Inicialização dos mapas
    function initializeMap() {
        map = L.map(mapElement, { preferCanvas: true }).setView([-15.7801, -47.9292], 4);
        map.createPane('unitMarkerPane');
        map.getPane('unitMarkerPane').style.zIndex = 650;
        L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
            subdomains: 'abcd',
            maxZoom: 19
        }).addTo(map);
        resetViewBtn.addEventListener('click', showCommandView);
    }

    function initializeHeatmap() {
        heatmap = L.map(heatmapElement, { preferCanvas: true, zoomControl: false, attributionControl: false }).setView([-15.7801, -47.9292], 4);
        L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
            subdomains: 'abcd',
            maxZoom: 19
        }).addTo(heatmap);
        heatLayer = L.heatLayer([], {
            radius: 25, blur: 15, maxZoom: 10,
            gradient: { 0.4: 'blue', 0.65: 'lime', 1: 'red' }
        }).addTo(heatmap);
    }

    let lastChoiceCount = 0;
    let bannerTimeout;

    // Funções de atualização da UI
    function updateStatus(data) {
        const { current_turn, user_classification, username, users } = data;

        // Bloquear apenas usuário consulta (god pode ver celebração)
        if (username === 'consulta') return;

        // Se current_turn > 43, significa que todos os usuários válidos já escolheram
        if (current_turn > 43) {
            // Verificar se já mostrou a celebração para evitar repetição
            if (!window.celebrationShown) {
                window.celebrationShown = true;

                // Aguardar um pouco para garantir que os dados foram atualizados
                setTimeout(() => {
                    showFinalCelebration(users, data.escolhas_feitas || {});
                }, 1000);
            }
            return;
        }

        // Status banner apenas para usuários não-god
        if (username === 'god') return;

        if (!statusBanner) {
            statusBanner = document.createElement('div');
            statusBanner.id = 'status-banner';
            document.body.appendChild(statusBanner);
        }

        clearTimeout(bannerTimeout);

        const isMyTurn = user_classification === current_turn;
        const currentUserChoosing = users.find(user => user.classification === current_turn);
        const choosingUsername = currentUserChoosing ? currentUserChoosing.username : `Militar ${current_turn}`;
        const message = isMyTurn ? 'É a sua vez de escolher!' : `Aguarde sua vez. ${choosingUsername} está escolhendo.`;
        
        statusBanner.className = `floating-status-banner alert ${isMyTurn ? 'alert-success' : 'alert-warning'}`;
        statusBanner.textContent = message;
        
        // Força o reinício da animação
        statusBanner.classList.remove('show');
        void statusBanner.offsetWidth; // Trigger reflow
        statusBanner.classList.add('show');

        // Mantém o banner visível se for a vez do usuário, ou o esconde após um tempo
        if (!isMyTurn) {
            bannerTimeout = setTimeout(() => {
                statusBanner.classList.remove('show');
            }, 5000); // Esconde depois de 5 segundos
        }
    }

    function updateUserList(data) {
        const { current_turn, users } = data;
        userList.innerHTML = '';

        // Filtrar apenas usuários com classification <= 43 (até MEIRELLES)
        const filteredUsers = users.filter(user => user.classification <= 43);

        filteredUsers.forEach((user, index) => {
            const li = document.createElement('li');
            li.className = 'list-group-item';
            if (user.classification === current_turn) {
                li.classList.add('active', 'active-turn');
            }
            li.innerHTML = `<span>${user.username}</span><span class="classification-badge">${index + 1}º</span>`;
            userList.appendChild(li);
        });
    }

    function updateChoiceLog(data) {
        const { escolhas_feitas, users } = data;
        const choiceCount = Object.keys(escolhas_feitas).length;

        const newChoices = choiceCount > lastChoiceCount;

        if (newChoices) {
            const lastChoiceClassification = Object.keys(escolhas_feitas).reduce((a, b) => Math.max(a, b));
            const lastChoiceUser = users.find(u => u.classification == lastChoiceClassification);
            const lastChoiceData = escolhas_feitas[lastChoiceClassification];
            const lastChoiceUnidade = typeof lastChoiceData === 'string' ? lastChoiceData : lastChoiceData.unidade_nome;
            showChoiceNotification(lastChoiceUser.username, lastChoiceUnidade);
        }

        lastChoiceCount = choiceCount;

        choiceLogBody.innerHTML = '';
        const sortedChoices = Object.entries(escolhas_feitas).sort(([classifA], [classifB]) => classifA - classifB);

        for (const [classif, choiceData] of sortedChoices) {
            const user = users.find(u => u.classification == classif);

            // Filtrar apenas usuários com classification <= 43
            if (!user || user.classification > 43) continue;

            const tr = document.createElement('tr');

            // Compatibilidade com formato antigo e novo
            const unidadeNome = typeof choiceData === 'string' ? choiceData : choiceData.unidade_nome;

            tr.innerHTML = `
                <td>${user.username}</td>
                <td>${unidadeNome}</td>
            `;
            choiceLogBody.appendChild(tr);
        }

        if (newChoices) {
            const lastRow = choiceLogBody.lastElementChild;
            if (lastRow) {
                lastRow.classList.add('new-choice');
                setTimeout(() => {
                    lastRow.classList.remove('new-choice');
                }, 2000);
            }
            choiceLog.scrollTop = choiceLog.scrollHeight;
        }
    }

    function updateHeatmap(data) {
        const heatPoints = data.unidades.map(u => [u.lat, u.lon, u.vagas]);
        heatLayer.setLatLngs(heatPoints);
    }

    // Lógica principal de controle do mapa
    function updateMap(data) {
        allUnidades = data.unidades;
        if (activeCommandName) {
            showUnitsInCommand(activeCommandName, false);
        } else {
            showCommandView(false);
        }
    }

    function showCommandView(fly = true) {
        activeCommandName = null;
        resetViewBtn.style.display = 'none';
        map.removeLayer(unitMarkers);
        commandMarkers.clearLayers();

        const commandVagas = Object.keys(militaryCommands).reduce((acc, key) => ({ ...acc, [key]: 0 }), {});

        allUnidades.forEach(unidade => {
            const command = Object.keys(militaryCommands).find(c => militaryCommands[c].unidades.includes(unidade.id));
            if (command) commandVagas[command] += unidade.vagas;
        });

        for (const [commandName, commandInfo] of Object.entries(militaryCommands)) {
            const vagas = commandVagas[commandName];
            let markerClass = 'region-marker';
            if (vagas === 1) {
                markerClass += ' pulse-animation';
            } else if (vagas === 0) {
                markerClass += ' no-vagas';
            }

            const marker = L.marker([commandInfo.lat, commandInfo.lon], {
                icon: L.divIcon({
                    className: markerClass,
                    html: `<div class="region-name">${commandName}</div><div class="region-vagas">Vagas: ${vagas}</div>`,
                    iconSize: [80, 80] /* Tamanho reduzido */
                })
            }).on('click', () => showUnitsInCommand(commandName));
            commandMarkers.addLayer(marker);
        }
        map.addLayer(commandMarkers);
        if (fly) map.flyTo([-15.7801, -47.9292], 4);
    }

    function showUnitsInCommand(commandName, fly = true) {
        activeCommandName = commandName;
        resetViewBtn.style.display = 'block';
        map.removeLayer(commandMarkers);
        unitMarkers.clearLayers();

        const unidadesInCommand = allUnidades.filter(u => militaryCommands[commandName].unidades.includes(u.id));
        const bounds = [];

        unidadesInCommand.forEach(unidade => {
            const { id, nome, cidade, lat, lon, vagas } = unidade;

            // Ocultar unidades sem vagas para evitar poluição visual
            if (vagas === 0) {
                return;
            }

            // Correção: Verificar a vez do usuário diretamente pelos dados da API
            const isTurn = window.user_classification === window.current_turn;

            // Determinar classe baseada no número de vagas
            let vagasClass = '';
            if (vagas === 1) {
                vagasClass = 'poucas-vagas';
            } else {
                vagasClass = 'muitas-vagas';
            }

            // Truncar nome se for muito longo
            const nomeDisplay = nome.length > 25 ? nome.substring(0, 22) + '...' : nome;

            const marker = L.marker([lat, lon], {
                icon: L.divIcon({
                    className: 'unit-marker',
                    html: `
                        <div class="unit-marker-container">
                            <div class="unit-marker-pin ${vagasClass}">
                                <div class="unit-marker-pin-content">${vagas}</div>
                            </div>
                            <div class="unit-marker-label" title="${nome}">
                                ${nomeDisplay}
                                <div class="unit-marker-tooltip">
                                    ${nome} - ${cidade}<br>
                                    Vagas: ${vagas}
                                </div>
                            </div>
                        </div>
                    `,
                    iconSize: [140, 70],
                    iconAnchor: [70, 55]
                }),
                pane: 'unitMarkerPane'
            });

            if (isTurn && vagas > 0) {
                marker.on('click', () => {
                    showChoiceModal(id, nome, cidade);
                });
            }
            unitMarkers.addLayer(marker);
            bounds.push([lat, lon]);
        });

        map.addLayer(unitMarkers);
        if (fly && bounds.length > 0) {
            map.flyToBounds(bounds, { padding: [50, 50] });
        }
    }

    function showChoiceNotification(username, unidade) {
        const notification = document.createElement('div');
        notification.className = 'choice-notification';
        notification.innerHTML = `<h1>Parabéns ${username}!</h1><p>Você escolheu a unidade ${unidade}.</p>`;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.classList.add('show');
        }, 100);

        // Voltar para vista ampla após 1.5 segundos
        setTimeout(() => {
            showCommandView(true);
        }, 1500);

        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 500);
        }, 5000);
    }

    // Variáveis globais para o modal
    let currentChoiceData = null;

    // Funções do modal de escolha
    function showChoiceModal(unidadeId, nome, cidade) {
        currentChoiceData = { unidadeId, nome, cidade };

        const modal = document.getElementById('choice-modal');
        const firstChoiceDisplay = document.getElementById('first-choice-display');

        firstChoiceDisplay.textContent = `${nome} - ${cidade}`;

        modal.style.display = 'block';
    }

    function closeChoiceModal() {
        const modal = document.getElementById('choice-modal');
        modal.style.display = 'none';
        currentChoiceData = null;
    }

    function confirmChoice() {
        if (!currentChoiceData) return;

        chooseLocation(currentChoiceData.unidadeId);
        closeChoiceModal();
    }

    // Fechar modal ao clicar fora
    document.addEventListener('click', function(event) {
        const modal = document.getElementById('choice-modal');
        if (event.target === modal) {
            closeChoiceModal();
        }
    });

    // Fechar modal com ESC
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape') {
            closeChoiceModal();
        }
    });

    // Funções da Tela de Celebração Final
    function showFinalCelebration(users, escolhas) {
        const overlay = document.getElementById('final-celebration');
        const grid = document.getElementById('celebration-grid');
        const dateElement = document.getElementById('celebration-date');

        // Filtrar e ordenar usuários válidos com suas escolhas
        const validUsers = users.filter(user => user.classification <= 43)
                                 .sort((a, b) => a.classification - b.classification);

        // Limpar grid
        grid.innerHTML = '';

        // Criar itens da celebração
        validUsers.forEach((user, index) => {
            const escolha = escolhas[user.classification];
            const unidadeNome = typeof escolha === 'string' ? escolha :
                               (escolha ? escolha.unidade_nome : 'Não escolhida');

            const item = document.createElement('div');
            item.className = 'celebration-item';
            item.innerHTML = `
                <div class="celebration-position">${index + 1}º</div>
                <div class="celebration-name">${user.username}</div>
                <div class="celebration-unit">${unidadeNome}</div>
            `;

            grid.appendChild(item);

            // Animação sequencial
            setTimeout(() => {
                item.classList.add('show');
            }, index * 50);
        });

        // Data e hora atual
        const now = new Date();
        const dateStr = now.toLocaleDateString('pt-BR') + ' - ' +
                       now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
        dateElement.textContent = `Finalizado em: ${dateStr}`;

        // Mostrar overlay
        overlay.classList.add('show');

        // Criar efeito de confetes
        createConfetti();
    }

    function closeFinalCelebration() {
        const overlay = document.getElementById('final-celebration');
        overlay.classList.remove('show');
    }

    function createConfetti() {
        const container = document.getElementById('celebration-particles');
        container.innerHTML = '';

        // Apenas ondas de energia centrais
        for (let i = 0; i < 3; i++) {
            const wave = document.createElement('div');
            wave.className = 'energy-wave';
            wave.style.animationDelay = (i * 1.5) + 's';
            container.appendChild(wave);
        }
    }


    // Tornar funções globais para uso no HTML
    window.showChoiceModal = showChoiceModal;
    window.closeChoiceModal = closeChoiceModal;
    window.confirmChoice = confirmChoice;
    window.closeFinalCelebration = closeFinalCelebration;

    // Comunicação com o servidor
    async function chooseLocation(unidadeId) {
        try {
            const requestBody = { unidade_id: unidadeId };

            const response = await fetch('/api/choose', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestBody)
            });
            const data = await response.json();
            if (!response.ok) {
                alert(data.message);
            } else {
                notificationSound.play().catch(e => console.error("Erro ao tocar som:", e));
                fetchData();
            }
        } catch (error) {
            console.error('Erro ao escolher a unidade:', error);
            alert('Ocorreu um erro ao processar sua escolha.');
        }
    }

    async function fetchData() {
        try {
            const response = await fetch('/api/status');
            const data = await response.json();
            window.current_turn = data.current_turn;
            window.user_classification = data.user_classification;

            // Passar dados completos para updateStatus para detecção de finalização
            updateStatus(data);
            updateUserList(data);
            updateMap(data);
            // updateHeatmap(data);
            updateChoiceLog(data);
        } catch (error) {
            console.error('Erro ao buscar dados:', error);
            // Não atualiza o banner aqui para não criar um banner de erro permanente
        }
    }

    // Inicialização
    initializeMap();
    // initializeHeatmap();
    fetchData(); // Carga inicial
    setInterval(fetchData, 3000); // Atualização periódica
});