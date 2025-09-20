document.addEventListener('DOMContentLoaded', () => {
    // --- Element Selectors ---
    const availableUnitsList = document.getElementById('available-units');
    const priorityList = document.getElementById('priority-list');
    const saveButton = document.getElementById('save-priorities-btn');
    const moveAllBtn = document.getElementById('move-all-btn');
    
    const runAllocationBtn = document.getElementById('run-allocation-btn');
    const resultsContainer = document.getElementById('results-container');
    const resultsBody = document.getElementById('results-body');
    const missingPrioritiesList = document.getElementById('missing-priorities-list');
    
    const statusBanner = document.getElementById('status-banner');

    // --- Student-specific Functions ---

    // Populates the lists for the student view
    function populateLists(unidades, savedPriorities) {
        availableUnitsList.innerHTML = '';
        priorityList.innerHTML = '';
        const savedPriorityIds = new Set(savedPriorities);

        // Add saved priorities to the right list
        savedPriorities.forEach(unidadeId => {
            const unidade = unidades.find(u => u.id === unidadeId);
            if (unidade) {
                priorityList.appendChild(createUnidadeElement(unidade));
            }
        });

        // Add remaining units to the left list
        unidades.forEach(unidade => {
            if (!savedPriorityIds.has(unidade.id)) {
                availableUnitsList.appendChild(createUnidadeElement(unidade));
            }
        });
    }
    
    // Creates a single unit element (li)
    function createUnidadeElement(unidade) {
        const li = document.createElement('li');
        li.className = 'priority-list-item';
        li.dataset.id = unidade.id;
        li.textContent = `${unidade.nome} - ${unidade.cidade}`;
        return li;
    }

    // Fetches all necessary data for the student view and initializes SortableJS
    async function initStudentView() {
        try {
            const statusResponse = await fetch('/api/status');
            const statusData = await statusResponse.json();
            
            const prioritiesResponse = await fetch('/api/get_priorities');
            const prioritiesData = await prioritiesResponse.json();
            
            populateLists(statusData.unidades, prioritiesData.priorities);

            // Initialize SortableJS *after* lists are populated
            new Sortable(availableUnitsList, {
                group: 'shared',
                animation: 150,
                ghostClass: 'sortable-ghost'
            });

            new Sortable(priorityList, {
                group: 'shared',
                animation: 150,
                ghostClass: 'sortable-ghost'
            });

        } catch (error) {
            console.error('Erro ao buscar dados do aluno:', error);
            statusBanner.textContent = 'Erro ao carregar dados.';
            statusBanner.className = 'alert alert-danger text-center';
        }
    }

    // Saves the student's priority list
    async function savePriorities() {
        const priorityIds = [...priorityList.children].map(item => parseInt(item.dataset.id));
        try {
            const response = await fetch('/api/save_priorities', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ priorities: priorityIds }),
            });
            const data = await response.json();
            if (data.success) {
                statusBanner.textContent = data.message;
                statusBanner.className = 'alert alert-success text-center';
            } else {
                statusBanner.textContent = data.message || 'Erro ao salvar prioridades.';
                statusBanner.className = 'alert alert-danger text-center';
            }
        } catch (error) {
            console.error('Erro ao salvar prioridades:', error);
            statusBanner.textContent = 'Erro de comunicação ao salvar.';
            statusBanner.className = 'alert alert-danger text-center';
        }
    }

    // --- Admin-specific Functions ---

    // Runs the allocation algorithm
    async function runAllocation() {
        if (!confirm('Tem certeza que deseja executar a prévia da alocação? Isso irá sobreescrever os resultados anteriores.')) {
            return;
        }
        try {
            const response = await fetch('/api/run_allocation', { method: 'POST' });
            const data = await response.json();
            if (data.success) {
                statusBanner.textContent = data.message;
                statusBanner.className = 'alert alert-success text-center';
                fetchAndDisplayResults();
            } else {
                statusBanner.textContent = data.message || 'Erro ao executar a alocação.';
                statusBanner.className = 'alert alert-danger text-center';
            }
        } catch (error) {
            console.error('Erro ao executar a alocação:', error);
            statusBanner.textContent = 'Erro de comunicação ao executar a alocação.';
            statusBanner.className = 'alert alert-danger text-center';
        }
    }

    // Fetches and displays the allocation results table
    async function fetchAndDisplayResults() {
        try {
            const response = await fetch('/api/allocation_results');
            const data = await response.json();
            resultsBody.innerHTML = '';
            if (data.results && data.results.length > 0) {
                data.results.forEach(result => {
                    const tr = document.createElement('tr');
                    tr.innerHTML = `<td>${result.username}</td><td>${result.unidade_nome}</td><td>${result.cidade}</td>`;
                    resultsBody.appendChild(tr);
                });
                resultsContainer.style.display = 'block';
            } else {
                resultsContainer.style.display = 'none';
            }
        } catch (error) {
            console.error('Erro ao buscar resultados da alocação:', error);
        }
    }

    // Fetches and displays the list of students with pending priorities
    async function fetchAndDisplayMissingPriorities() {
        if (!missingPrioritiesList) return;
        try {
            const response = await fetch('/api/missing_priorities');
            const data = await response.json();
            missingPrioritiesList.innerHTML = '';
            if (data.missing_users && data.missing_users.length > 0) {
                data.missing_users.forEach(username => {
                    const li = document.createElement('li');
                    li.className = 'list-group-item';
                    li.textContent = username;
                    missingPrioritiesList.appendChild(li);
                });
                // Keep allocation button disabled
                if (runAllocationBtn) runAllocationBtn.disabled = true;
            } else {
                const li = document.createElement('li');
                li.className = 'list-group-item list-group-item-success'; // Use a success color
                li.textContent = 'Todos os alunos já definiram suas prioridades.';
                missingPrioritiesList.appendChild(li);
                // Enable allocation button
                if (runAllocationBtn) runAllocationBtn.disabled = false;
            }
        } catch (error) {
            console.error('Erro ao buscar alunos pendentes:', error);
        }
    }

    // --- Main Initialization Logic ---

    function showSaveNotification() {
        const notification = document.getElementById('save-notification');
        notification.classList.add('show');
        setTimeout(() => {
            notification.classList.remove('show');
        }, 2000); // A notificação desaparece após 2 segundos
    }

    function enableSaveButton() {
        if (saveButton) {
            saveButton.disabled = false;
        }
    }

    // Check if we are on the student page
    if (availableUnitsList && priorityList) {
        initStudentView();

        if (saveButton) {
            saveButton.addEventListener('click', () => {
                savePriorities().then(() => {
                    saveButton.disabled = true;
                    showSaveNotification();
                });
            });
        }
        if (moveAllBtn) {
            moveAllBtn.addEventListener('click', () => {
                while (availableUnitsList.firstChild) {
                    priorityList.appendChild(availableUnitsList.firstChild);
                }
                enableSaveButton(); // Habilita o botão ao mover todos
            });
        }

        // Adiciona um listener ao Sortable para reativar o botão ao arrastar
        const sortablePriorityList = new Sortable(priorityList, {
            group: 'shared',
            animation: 150,
            ghostClass: 'sortable-ghost',
            onEnd: enableSaveButton // Habilita o botão ao final do arrasto
        });

    } 
    // Check if we are on the admin page
    else if (missingPrioritiesList) {
        fetchAndDisplayResults();
        fetchAndDisplayMissingPriorities();
        if (runAllocationBtn) {
            runAllocationBtn.addEventListener('click', runAllocation);
        }
    }
});