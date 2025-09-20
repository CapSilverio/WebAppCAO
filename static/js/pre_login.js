$(document).ready(function() {
    // Função para buscar e atualizar o ranking
    function updateRanking() {
        $.ajax({
            url: '/pre_login_ranking',
            type: 'GET',
            success: function(response) {
                const rankingList = $('#pre-ranking-list');
                rankingList.empty(); // Limpa a lista antes de adicionar os novos itens

                if (response.ranking && response.ranking.length > 0) {
                    response.ranking.forEach((item, index) => {
                        // Adiciona um ícone de medalha para os 3 primeiros
                        let medal = '';
                        if (index === 0) medal = '&#129351;'; // Ouro
                        else if (index === 1) medal = '&#129352;'; // Prata
                        else if (index === 2) medal = '&#129353;'; // Bronze

                        rankingList.append(
                            `<li>
                                <span class="rank-position">${index + 1}º ${medal}</span>
                                <span class="rank-name">${item.name}</span>
                                <span class="rank-score">${item.score.toLocaleString('pt-BR', { minimumFractionDigits: 3, maximumFractionDigits: 3 })}</span>
                            </li>`
                        );
                    });
                } else {
                    rankingList.append('<li>Ainda ninguém se classificou. Seja o primeiro!</li>');
                }
            },
            error: function() {
                $('#pre-ranking-message').text('Erro ao carregar o ranking.').addClass('error');
            }
        });
    }

    // Lida com o envio do formulário de pré-ranking
    $('#pre-ranking-form').on('submit', function(e) {
        e.preventDefault();

        const name = $('#pre-ranking-name').val();
        const score = $('#pre-ranking-score').val();
        const token = $('#pre-ranking-token').val();

        $.ajax({
            url: '/pre_login_ranking',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({ name: name, score: score, token: token }),
            success: function(response) {
                if (response.success) {
                    $('#pre-ranking-message').text('Adicionado com sucesso!').addClass('success').removeClass('error');
                    $('#pre-ranking-form')[0].reset(); // Limpa o formulário
                    updateRanking(); // Atualiza a lista
                } else {
                    $('#pre-ranking-message').text(response.message || 'Erro desconhecido.').addClass('error').removeClass('success');
                }
            },
            error: function(xhr) {
                const errorMessage = xhr.responseJSON ? xhr.responseJSON.message : 'Erro ao adicionar. Verifique os dados.';
                $('#pre-ranking-message').text(errorMessage).addClass('error').removeClass('success');
            }
        });
    });

    // Carrega o ranking inicial ao carregar a página
    updateRanking();
});