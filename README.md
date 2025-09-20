# Projeto de Simulação de Escolha de Vagas

## 1. Descrição Geral

Este é um aplicativo web desenvolvido para simular o processo de escolha de Unidades Militares (OM) pelos alunos de um curso de formação, como o da ESAO. O sistema permite que os alunos, com base em sua classificação final, escolham as vagas disponíveis em diversas OMs espalhadas pelo Brasil.

O objetivo principal é fornecer uma ferramenta transparente, justa e que permita aos alunos testar diferentes cenários de escolha, seja em tempo real ou através de um sistema de prioridades.

## 2. Funcionalidades

O sistema possui três modalidades principais de simulação:

### a. Pré-Classificação (Tela de Login)

-   **Ranking Dinâmico:** Antes mesmo de fazer o login, os usuários podem inserir um nome/pseudônimo e uma nota para participar de uma pré-classificação.
-   **Visualização Instantânea:** Uma lista é exibida e atualizada em tempo real, ordenando os participantes pela maior nota.
-   **Validação e Formatação:** O nome é sempre exibido em maiúsculas e a nota é validada para aceitar apenas números (com ponto ou vírgula) e formatada com 3 casas decimais.
-   **Dados Temporários:** As informações deste ranking são armazenadas apenas em memória, sendo reiniciadas junto com o servidor.

### b. Escolha em Tempo Real

-   **Login Individual:** Cada aluno possui um login (nome de guerra) e senha.
-   **Ordem de Escolha:** A escolha é feita em ordem de classificação. O sistema libera o próximo aluno a escolher assim que o anterior finaliza.
-   **Visualização Dinâmica:** Todos os participantes podem acompanhar em tempo real as escolhas feitas, as vagas restantes e quem é o próximo a escolher.
-   **Interface do Administrador:** Uma visão de "Deus" (god mode) que permite ao administrador acompanhar todo o processo, resetar a simulação, gerenciar usuários, vagas e também **zerar o ranking da pré-classificação**.
-   **Efeitos Visuais:** O sistema conta com efeitos visuais para facilitar a identificação de informações importantes:
    -   **Pulso Vermelho:** Um efeito de pulso vermelho é exibido ao redor do círculo de um comando militar de área quando resta apenas uma vaga para ser escolhida.
    -   **Círculo Cinza:** O círculo de um comando militar de área fica cinza quando não há mais vagas disponíveis.

### c. Simulação por Prioridades

-   **Definição de Prioridades:** Cada aluno pode, a qualquer momento antes do processamento, definir a sua ordem de preferência para todas as unidades disponíveis.
-   **Algoritmo de Alocação:** O administrador pode rodar um algoritmo que aloca cada aluno à sua OM de maior prioridade que ainda possua vaga, sempre respeitando a ordem de classificação.
-   **Visualização de Resultados:** Após o processamento, o sistema exibe a lista final de alocação para todos os participantes.
-   **Controle de Pendências:** O administrador consegue visualizar quais alunos ainda não preencheram suas listas de prioridades.

## 3. Estrutura do Projeto

O projeto é organizado da seguinte forma:

```
D:\TESTE GEMINI\
├───app.py              # Arquivo principal do Flask (backend)
├───database.db         # Banco de dados SQLite
├───index.html          # Arquivo de entrada da aplicação
├───README.md           # Documentação do projeto
├───static\             # Arquivos estáticos (CSS, JS, Imagens)
│   ├───css\
│   │   ├───admin.css
│   │   ├───dashboard.css
│   │   ├───login.css
│   │   └───style.css
│   ├───images\
│   │   └───esaologo.png
│   ├───js\
│   │   ├───admin.js
│   │   ├───color_picker.js
│   │   ├───dashboard.js
│   │   ├───drag.js
│   │   ├───grid.js
│   │   ├───magic_orb.js
│   │   ├───particles.js
│   │   ├───pre_login.js
│   │   ├───priorities.js
│   │   └───script.js
│   └───sounds\
│       └───notification.mp3
└───templates\          # Templates HTML (frontend)
    ├───admin.html
    ├───dashboard.html
    ├───index.html
    ├───next_page.html
    └───priorities.html
```

## 4. Tecnologias Utilizadas

-   **Backend:**
    -   **Flask:** Um microframework web para Python.
    -   **SQLite:** Um banco de dados relacional leve e baseado em arquivo.
-   **Frontend:**
    -   **HTML5 / CSS3:** Estrutura e estilo das páginas.
    -   **JavaScript:** Interatividade e comunicação com o backend.
    -   **Bootstrap:** Framework CSS para design responsivo.
    -   **Leaflet.js:** Biblioteca para criação de mapas interativos.
-   **Bibliotecas Python:**
    -   `bcrypt`: Para hashing de senhas.

## 5. Como Executar o Projeto

1.  **Instalar as dependências:**
    ```bash
    pip install Flask bcrypt
    ```
2.  **Executar o aplicativo:**
    ```bash
    python app.py
    ```
3.  **Acessar no navegador:**
    -   Abra o seu navegador e acesse `http://127.0.0.1:5000`.

## 6. Próximos Passos e Melhorias

Esta seção pode ser usada para documentar as futuras implementações e melhorias planejadas para o projeto.

-   [ ] Melhorar a interface visual.
-   [ ] Adicionar testes automatizados.
-   [ ] Refatorar o código para melhor escalabilidade.
-   [ ] Adicionar um sistema de notificações em tempo real mais robusto (e.g., WebSockets).
-   [ ] Criar um painel de controle mais completo para o administrador.