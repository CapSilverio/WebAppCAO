$(document).ready(function() {
    // Alternar entre formulários de login e registro
    $('#login-toggle').click(function() {
        $('#login-form').addClass('active');
        $('#register-form').removeClass('active');
        $(this).addClass('active');
        $('#register-toggle').removeClass('active');
        $('#login-message').empty().removeClass('success error');
        $('#register-message').empty().removeClass('success error');
    });

    $('#register-toggle').click(function() {
        $('#register-form').addClass('active');
        $('#login-form').removeClass('active');
        $(this).addClass('active');
        $('#login-toggle').removeClass('active');
        $('#login-message').empty().removeClass('success error');
        $('#register-message').empty().removeClass('success error');
    });

    // Submissão do formulário de registro
    $('#register-form').submit(function(e) {
        e.preventDefault();
        var formData = {
            'username': $('#register-username').val(),
            'email': $('#register-email').val(),
            'password': $('#register-password').val()
        };

        $.ajax({
            type: 'POST',
            url: '/register',
            data: JSON.stringify(formData),
            contentType: 'application/json',
            dataType: 'json',
            success: function(response) {
                var $messageDiv = $('#register-message');
                $messageDiv.text(response.message);
                if (response.success) {
                    $messageDiv.removeClass('error').addClass('success');
                    $('#register-form')[0].reset();
                    $('#login-toggle').click();
                } else {
                    $messageDiv.removeClass('success').addClass('error');
                }
            },
            error: function() {
                $('#register-message').text('Erro na comunicação com o servidor.').removeClass('success').addClass('error');
            }
        });
    });

    // Submissão do formulário de login
    $('#login-form').submit(function(e) {
        e.preventDefault();
        var formData = {
            'username_or_email': $('#login-username-email').val(),
            'password': $('#login-password').val()
        };

        $.ajax({
            type: 'POST',
            url: '/login',
            data: JSON.stringify(formData),
            contentType: 'application/json',
            dataType: 'json',
            success: function(response) {
                var $messageDiv = $('#login-message');
                $messageDiv.text(response.message);
                if (response.success) {
                    $messageDiv.removeClass('error').addClass('success');
                    window.location.href = response.redirect;
                } else {
                    $messageDiv.removeClass('success').addClass('error');
                }
            },
            error: function() {
                $('#login-message').text('Erro na comunicação com o servidor.').removeClass('success').addClass('error');
            }
        });
    });
});
