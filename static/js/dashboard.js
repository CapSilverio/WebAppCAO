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
        'CMP': { lat: -14.0, lon: -47.8825, name: 'Comando Militar do Planalto', unidades: [14, 30] },
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

        if (username === 'consulta') return;

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
        users.forEach((user, index) => {
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
            const lastChoiceUnidade = escolhas_feitas[lastChoiceClassification];
            showChoiceNotification(lastChoiceUser.username, lastChoiceUnidade);
        }

        lastChoiceCount = choiceCount;

        choiceLogBody.innerHTML = '';
        const sortedChoices = Object.entries(escolhas_feitas).sort(([classifA], [classifB]) => classifA - classifB);

        for (const [classif, unidadeNome] of sortedChoices) {
            const user = users.find(u => u.classification == classif);
            const tr = document.createElement('tr');
            tr.innerHTML = `<td>${user.username}</td><td>${unidadeNome}</td>`;
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
            
            // Correção: Verificar a vez do usuário diretamente pelos dados da API
            const isTurn = window.user_classification === window.current_turn;

            const marker = L.marker([lat, lon], {
                icon: L.divIcon({
                    className: 'unit-marker',
                    html: `<div><div class="unit-marker-pin"><div class="unit-marker-pin-content">${vagas}</div></div><div class="unit-marker-label">${nome}</div></div>`,
                }),
                pane: 'unitMarkerPane'
            });

            if (isTurn && vagas > 0) {
                marker.on('click', () => {
                    if (confirm(`Confirmar escolha pela unidade ${nome} em ${cidade}?`)) {
                        chooseLocation(id);
                    }
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

        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 500);
        }, 5000);
    }

    // Comunicação com o servidor
    async function chooseLocation(unidadeId) {
        try {
            const response = await fetch('/api/choose', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ unidade_id: unidadeId })
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