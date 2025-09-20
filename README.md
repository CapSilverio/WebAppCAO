# WebApp CAO Eng - Sistema de Escolha de Vagas e Eletivas

## 1. Descrição Geral

Este é um aplicativo web desenvolvido para simular o processo de escolha de Unidades Militares (OM) e disciplinas eletivas pelos alunos de um curso de formação, como o da ESAO. O sistema permite que os alunos, com base em sua classificação final, escolham as vagas disponíveis em diversas OMs espalhadas pelo Brasil, além de gerenciar a escolha de disciplinas eletivas.

O objetivo principal é fornecer uma ferramenta transparente, justa e que permita aos alunos testar diferentes cenários de escolha, seja em tempo real ou através de um sistema de prioridades.

## 2. Funcionalidades

O sistema possui quatro modalidades principais:

### a. Pré-Classificação (Tela de Login)

-   **Ranking Dinâmico:** Antes mesmo de fazer o login, os usuários podem inserir um nome/pseudônimo e uma nota para participar de uma pré-classificação.
-   **Visualização Instantânea:** Uma lista é exibida e atualizada em tempo real, ordenando os participantes pela maior nota.
-   **Validação e Formatação:** O nome é sempre exibido em maiúsculas e a nota é validada para aceitar apenas números (com ponto ou vírgula) e formatada com 3 casas decimais.
-   **Dados Temporários:** As informações deste ranking são armazenadas apenas em memória, sendo reiniciadas junto com o servidor.

### b. Escolha de Unidades Militares em Tempo Real

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

### d. Sistema de Disciplinas Eletivas

-   **Gestão de Eletivas:** Interface administrativa para cadastrar e gerenciar disciplinas eletivas disponíveis.
-   **Escolha de Eletivas:** Sistema separado onde alunos podem escolher suas disciplinas eletivas.
-   **Controle de Vagas:** Gerenciamento do número de vagas disponíveis por disciplina eletiva.
-   **Interface Administrativa:** Painel específico para administração das disciplinas eletivas.

## 3. Estrutura do Projeto

O projeto é organizado da seguinte forma:

```
WebApp CAO Eng\
├───app.py                      # Arquivo principal do Flask (backend)
├───database.db                 # Banco de dados SQLite
├───index.html                  # Arquivo de entrada da aplicação
├───README.md                   # Documentação do projeto
├───static\                     # Arquivos estáticos (CSS, JS, Imagens)
│   ├───css\
│   │   ├───admin.css           # Estilos da interface administrativa
│   │   ├───admin_eletivas.css  # Estilos do admin de eletivas
│   │   ├───dashboard.css       # Estilos do painel principal
│   │   ├───escolher_eletivas.css # Estilos da escolha de eletivas
│   │   ├───login.css           # Estilos da tela de login
│   │   └───style.css           # Estilos gerais
│   ├───images\
│   │   └───esaologo.png        # Logo da ESAO
│   ├───js\
│   │   ├───admin.js            # Funcionalidades do admin principal
│   │   ├───admin_eletivas.js   # Funcionalidades do admin de eletivas
│   │   ├───color_picker.js     # Seletor de cores
│   │   ├───dashboard.js        # Funcionalidades do painel
│   │   ├───drag.js             # Funcionalidades de drag and drop
│   │   ├───escolher_eletivas.js # Funcionalidades de escolha de eletivas
│   │   ├───grid.js             # Sistema de grid
│   │   ├───magic_orb.js        # Efeitos visuais especiais
│   │   ├───particles.js        # Sistema de partículas
│   │   ├───pre_login.js        # Funcionalidades da pré-classificação
│   │   ├───priorities.js       # Sistema de prioridades
│   │   └───script.js           # Scripts gerais
│   └───sounds\
│       └───notification.mp3    # Som de notificação
└───templates\                  # Templates HTML (frontend)
    ├───admin.html              # Interface administrativa principal
    ├───admin_eletivas.html     # Interface administrativa de eletivas
    ├───dashboard.html          # Painel principal do usuário
    ├───escolher_eletivas.html  # Tela de escolha de eletivas
    ├───index.html              # Tela de login e pré-classificação
    ├───next_page.html          # Página de transição
    └───priorities.html         # Tela de definição de prioridades
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

## 6. Como Customizar as Unidades/Organizações Militares

Para adaptar o sistema para outras armas ou unidades militares:

### Método 1: Editando o código fonte
1. **Edite o arquivo `app.py`**
2. **Localize a função `get_initial_unidades()` (linha 15)**
3. **Substitua a lista de unidades** pelos dados da sua arma:
   ```python
   def get_initial_unidades():
       unidades = [
           {'id': 1, 'nome': 'Sua Unidade 1', 'cidade': 'Cidade-UF', 'lat': -23.5505, 'lon': -46.6333, 'vagas': 0},
           {'id': 2, 'nome': 'Sua Unidade 2', 'cidade': 'Cidade-UF', 'lat': -22.9068, 'lon': -43.1729, 'vagas': 0},
           # ... adicione mais unidades conforme necessário
       ]
   ```

### Método 2: Usando a interface administrativa
1. **Faça login como administrador** (admin/123123)
2. **Acesse a aba "Gerenciar Unidades"**
3. **Adicione, edite ou remova unidades** através da interface

### Informações necessárias para cada unidade:
- **ID**: Número único identificador
- **Nome**: Nome da unidade militar
- **Cidade**: Localização (formato: "Cidade-UF")
- **Latitude/Longitude**: Coordenadas para exibição no mapa
- **Vagas**: Número de vagas disponíveis (inicialmente 0, será configurado pelo admin)

### Dica importante:
- Após editar o código, **delete o arquivo `database.db`** para que as novas unidades sejam criadas
- O sistema irá recriar automaticamente o banco com os novos dados

## 7. Próximos Passos e Melhorias

Esta seção pode ser usada para documentar as futuras implementações e melhorias planejadas para o projeto.

-   [ ] Melhorar a interface visual.
-   [ ] Adicionar testes automatizados.
-   [ ] Refatorar o código para melhor escalabilidade.
-   [ ] Adicionar um sistema de notificações em tempo real mais robusto (e.g., WebSockets).
-   [ ] Criar um painel de controle mais completo para o administrador.