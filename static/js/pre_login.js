$(document).ready(function() {
    // Função para gerenciar as abas
    $('.tab-btn').on('click', function() {
        const targetTab = $(this).data('tab');
        const tabContainer = $(this).closest('.pre-login-card');

        // Remove active das abas e conteúdos do container atual
        tabContainer.find('.tab-btn').removeClass('active');
        tabContainer.find('.tab-content').removeClass('active');

        // Adiciona active na aba clicada e no conteúdo correspondente
        $(this).addClass('active');
        tabContainer.find(`#${targetTab}`).addClass('active');
    });

    // Função para buscar e atualizar ambos os rankings
    function updateRanking() {
        $.ajax({
            url: '/pre_login_ranking?type=both',
            type: 'GET',
            success: function(response) {
                // Atualizar ranking por nota
                const scoreRankingList = $('#pre-ranking-score-list');
                scoreRankingList.empty();

                if (response.ranking_score && response.ranking_score.length > 0) {
                    response.ranking_score.forEach((item, index) => {
                        let medal = '';
                        if (index === 0) medal = '&#129351;'; // Ouro
                        else if (index === 1) medal = '&#129352;'; // Prata
                        else if (index === 2) medal = '&#129353;'; // Bronze

                        scoreRankingList.append(
                            `<li>
                                <div class="rank-left">
                                    <span class="rank-position">${index + 1}º ${medal}</span>
                                    <span class="rank-name">${item.name}</span>
                                </div>
                                <span class="rank-score">${item.score.toLocaleString('pt-BR', { minimumFractionDigits: 3, maximumFractionDigits: 3 })}</span>
                            </li>`
                        );
                    });
                } else {
                    scoreRankingList.append('<li>Ainda ninguém se classificou por nota. Seja o primeiro!</li>');
                }

                // Atualizar ranking por posição
                const positionRankingList = $('#pre-ranking-position-list');
                positionRankingList.empty();

                if (response.ranking_position && response.ranking_position.length > 0) {
                    response.ranking_position.forEach((item, index) => {
                        let medal = '';
                        if (index === 0) medal = '&#129351;'; // Ouro
                        else if (index === 1) medal = '&#129352;'; // Prata
                        else if (index === 2) medal = '&#129353;'; // Bronze

                        positionRankingList.append(
                            `<li>
                                <div class="rank-left">
                                    <span class="rank-position">${item.position}º ${medal}</span>
                                    <span class="rank-name">${item.name}</span>
                                </div>
                            </li>`
                        );
                    });
                } else {
                    positionRankingList.append('<li>Ainda ninguém se classificou por posição. Seja o primeiro!</li>');
                }
            },
            error: function() {
                $('#pre-ranking-score-message').text('Erro ao carregar o ranking.').addClass('error');
                $('#pre-ranking-position-message').text('Erro ao carregar o ranking.').addClass('error');
            }
        });
    }

    // Lida com o envio do formulário por nota
    $('#pre-ranking-score-form').on('submit', function(e) {
        e.preventDefault();

        const name = $('#pre-ranking-name-score').val();
        const score = $('#pre-ranking-score').val();
        const token = $('#pre-ranking-token-score').val();

        $.ajax({
            url: '/pre_login_ranking',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
                name: name,
                score: score,
                token: token,
                ranking_type: 'score'
            }),
            success: function(response) {
                if (response.success) {
                    $('#pre-ranking-score-message').text('Adicionado com sucesso!').addClass('success').removeClass('error');
                    $('#pre-ranking-score-form')[0].reset(); // Limpa o formulário
                    updateRanking(); // Atualiza a lista
                } else {
                    $('#pre-ranking-score-message').text(response.message || 'Erro desconhecido.').addClass('error').removeClass('success');
                }
            },
            error: function(xhr) {
                const errorMessage = xhr.responseJSON ? xhr.responseJSON.message : 'Erro ao adicionar. Verifique os dados.';
                $('#pre-ranking-score-message').text(errorMessage).addClass('error').removeClass('success');
            }
        });
    });

    // Lida com o envio do formulário por posição
    $('#pre-ranking-position-form').on('submit', function(e) {
        e.preventDefault();

        const name = $('#pre-ranking-name-position').val();
        const position = $('#pre-ranking-position').val();
        const token = $('#pre-ranking-token-position').val();

        $.ajax({
            url: '/pre_login_ranking',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
                name: name,
                position: position,
                token: token,
                ranking_type: 'position'
            }),
            success: function(response) {
                if (response.success) {
                    $('#pre-ranking-position-message').text('Adicionado com sucesso!').addClass('success').removeClass('error');
                    $('#pre-ranking-position-form')[0].reset(); // Limpa o formulário
                    updateRanking(); // Atualiza a lista
                } else {
                    $('#pre-ranking-position-message').text(response.message || 'Erro desconhecido.').addClass('error').removeClass('success');
                }
            },
            error: function(xhr) {
                const errorMessage = xhr.responseJSON ? xhr.responseJSON.message : 'Erro ao adicionar. Verifique os dados.';
                $('#pre-ranking-position-message').text(errorMessage).addClass('error').removeClass('success');
            }
        });
    });

    // Carrega o ranking inicial ao carregar a página
    updateRanking();
});