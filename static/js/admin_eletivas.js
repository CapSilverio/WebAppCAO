document.addEventListener('DOMContentLoaded', function() {
    const addForm = document.getElementById('add-eletiva-form');
    const eletivasTableBody = document.querySelector('#eletivas-table tbody');
    
    // Lógica do Modal de Edição com Bootstrap
    const editModalElement = document.getElementById('edit-modal');
    const editModal = new bootstrap.Modal(editModalElement);
    const editForm = document.getElementById('edit-eletiva-form');
    const saveEditBtn = document.getElementById('save-edit-btn');

    // Função para carregar as eletivas na tabela
    async function loadEletivas() {
        try {
            const response = await fetch('/api/eletivas');
            if (!response.ok) {
                throw new Error('Falha ao buscar eletivas.');
            }
            const eletivas = await response.json();
            
            eletivasTableBody.innerHTML = ''; // Limpa a tabela antes de preencher

            eletivas.forEach(eletiva => {
                const row = `
                    <tr data-id="${eletiva.id}">
                        <td>${eletiva.nome_materia}</td>
                        <td>${eletiva.vagas}</td>
                        <td class="actions">
                            <button class="btn btn-warning btn-sm btn-edit">Editar</button>
                            <button class="btn btn-danger btn-sm btn-delete">Excluir</button>
                        </td>
                    </tr>
                `;
                eletivasTableBody.insertAdjacentHTML('beforeend', row);
            });
        } catch (error) {
            console.error('Erro:', error);
            alert(error.message);
        }
    }

    // Adicionar nova eletiva
    addForm.addEventListener('submit', async function(event) {
        event.preventDefault();
        const formData = new FormData(addForm);
        const data = {
            nome_materia: formData.get('nome_materia'),
            vagas: parseInt(formData.get('vagas'), 10)
        };

        try {
            const response = await fetch('/api/eletivas/add', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            const result = await response.json();
            if (!result.success) {
                throw new Error(result.message || 'Falha ao adicionar matéria.');
            }
            addForm.reset();
            loadEletivas(); // Recarrega a lista
        } catch (error) {
            console.error('Erro:', error);
            alert(error.message);
        }
    });

    // Ações de Editar e Excluir na tabela
    eletivasTableBody.addEventListener('click', async function(event) {
        const target = event.target;
        const row = target.closest('tr');
        if (!row) return;
        const id = row.dataset.id;

        // Excluir
        if (target.classList.contains('btn-delete')) {
            if (!confirm('Tem certeza que deseja excluir esta matéria?')) {
                return;
            }
            try {
                const response = await fetch(`/api/eletivas/delete/${id}`, { method: 'POST' });
                const result = await response.json();
                if (!result.success) {
                    throw new Error(result.message || 'Falha ao excluir.');
                }
                loadEletivas(); // Recarrega a lista
            } catch (error) {
                console.error('Erro:', error);
                alert(error.message);
            }
        }

        // Editar (abrir modal)
        if (target.classList.contains('btn-edit')) {
            const nome = row.children[0].textContent;
            const vagas = row.children[1].textContent;
            
            document.getElementById('edit-eletiva-id').value = id;
            document.getElementById('edit-nome_materia').value = nome;
            document.getElementById('edit-vagas').value = vagas;
            
            editModal.show();
        }
    });

    // Salvar alterações do modal de edição
    saveEditBtn.addEventListener('click', async function() {
        const id = document.getElementById('edit-eletiva-id').value;
        const data = {
            nome_materia: document.getElementById('edit-nome_materia').value,
            vagas: parseInt(document.getElementById('edit-vagas').value, 10)
        };

        try {
            const response = await fetch(`/api/eletivas/edit/${id}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            const result = await response.json();
            if (!result.success) {
                throw new Error(result.message || 'Falha ao salvar alterações.');
            }
            editModal.hide();
            loadEletivas(); // Recarrega a lista
        } catch (error) {
            console.error('Erro:', error);
            alert(error.message);
        }
    });

    // Carregar dados iniciais
    loadEletivas();
});