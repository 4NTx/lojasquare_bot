# Bot de Notificação de Entregas

Este projeto é um bot de Discord para notificação de entregas realizadas por meio da API LojaSquare. Ele verifica periodicamente novas entregas e envia notificações no canal configurado do Discord.

## Estrutura do Projeto

- **src/**: Contém o código-fonte do projeto.

  - **api/**: Contém a integração com a API LojaSquare.
    - `lojasquare.ts`
  - **db/**: Contém a configuração e a conexão com o banco de dados.
    - `database.ts`
  - **embeds/**: Contém a configuração das mensagens de embed do Discord.
    - `entregaFeitasEmbeds.ts`
    - `entregaPendentesEmbeds.ts`
  - **services/**: Contém os serviços principais do bot.
    - `entregaService.ts`
    - `entregasFeitaService.ts`
    - `entregasPendentesService.ts`
  - **utils/**: Contém utilitários usados no projeto.
    - `dataUtil.ts`
    - `loggerUtil.ts`
  - **index.ts**: Arquivo principal que inicializa o bot.
  - **botStatus.ts**: Configuração de status rotativos do bot.

- **config.yml**: Arquivo de configuração que contém todas as variáveis necessárias para o funcionamento do bot.

## Configuração

### Pré-requisitos

- Node.js
- Yarn ou npm
- MariaDB ou MySQL (PHPMYADMIN SERVE)

### Passos para Configuração

1. **Clone o repositório**

   ```bash
   git clone https://github.com/4ntx/lojasquare_bot
   cd lojasquare_bot
   ```

2. **Instale as dependências**

   ```bash
   yarn install
   # ou
   npm install
   ```

3. **Configure o arquivo `config.yml`**

Edite o arquivo `config.yml` com suas configurações:

```yaml
# Configurações do bot
bot:
  depurar: false
  token: "TOKEN DO BOT"
  status_intervalo_segundos: 10
  status_aleatorio: false
  status_rotativos:
    - nome: "Status 01"
      tipo: "WATCHING"
    - nome: "Status 02"
      tipo: "LISTENING"
    - nome: "Status 03"
      tipo: "PLAYING"
    - nome: "Status 04"
      tipo: "COMPETING"

# Configurações do Banco de Dados
database:
  depurar: false
  host: "localhost"
  porta: 3306
  usuario: "usuario"
  senha: "senha"
  database_nome: "lojasquare"

# Configurações da API LojaSquare
lojasquare:
  depurar: false
  api_secret: "secret-api-lojasquare"
  intervalo_de_checagem_segundos: 20

# Configurações de entregas feitas
entregas_feitas:
  depurar: false
  ativar: true
  usar_sub_servidor: true
  sub_servidores:
    - nome: "SERVIDOR"
      canal: "CANAL-ID"
    - nome: "SERVIDOR2"
      canal: "CANAL-ID2"
  canal_de_entregas_geral: "CANAL-ID-ENTREGAS-GERAL"
  notificacao:
    titulo_sucesso: "Entrega Realizada com Sucesso!"
    titulo_multiplas_entregas: "Entregas Realizadas com Sucesso!"
    campos:
      produto:
        mostrar: true
        inline: true
        nome: "Produto"
        desconhecido: "Desconhecido"
      quantidade:
        mostrar: true
        inline: true
        nome: "Quantidade"
        desconhecido: "0"
      player:
        mostrar: true
        inline: true
        nome: "Player"
        desconhecido: "Desconhecido"
      servidor:
        mostrar: true
        inline: true
        nome: "Servidor"
        desconhecido: "Desconhecido"
      subservidor:
        mostrar: true
        inline: true
        nome: "SubServidor"
        desconhecido: "Desconhecido"
      codigo:
        mostrar: true
        inline: true
        nome: "Código"
        desconhecido: "Desconhecido"
      status:
        mostrar: true
        inline: true
        nome: "Status"
        desconhecido: "Desconhecido"
      atualizado_em:
        mostrar: true
        inline: true
        nome: "Atualizado Em"
        desconhecido: "Desconhecido"
    cor: "#004D40"
    footer:
      usar: true
      texto: "lojasquare.com.br"
      icone_url: "https://imgur.com/5PoEefz.png"
    imagem:
      usar: true
      url: "https://i.imgur.com/TMHNcvD.png"

# Configurações de entregas pendentes
entregas_pendentes:
  depurar: false
  ativar: true
  usar_sub_servidor: true
  sub_servidores:
    - nome: "RANKUP"
      canal: "1244017763329245185"
    - nome: "FACTIONS"
      canal: "1244017795088388156"
  canal_de_entregas_geral: "1244017779980632176"
  notificacao:
    titulo_sucesso: "Entrega Pendente"
    titulo_multiplas_entregas: "Entregas Pendentes"
    campos:
      produto:
        mostrar: true
        inline: true
        nome: "Produto"
        desconhecido: "Desconhecido"
      quantidade:
        mostrar: true
        inline: true
        nome: "Quantidade"
        desconhecido: "0"
      player:
        mostrar: true
        inline: true
        nome: "Player"
        desconhecido: "Desconhecido"
      servidor:
        mostrar: true
        inline: true
        nome: "Servidor"
        desconhecido: "Desconhecido"
      subservidor:
        mostrar: true
        inline: true
        nome: "SubServidor"
        desconhecido: "Desconhecido"
      codigo:
        mostrar: true
        inline: true
        nome: "Código"
        desconhecido: "Desconhecido"
      status:
        mostrar: true
        inline: true
        nome: "Status"
        desconhecido: "Desconhecido"
      atualizado_em:
        mostrar: true
        inline: true
        nome: "Atualizado Em"
        desconhecido: "Desconhecido"
    cor: "#FFFFFF"
    footer:
      usar: true
      texto: "lojasquare.com.br"
      icone_url: "https://imgur.com/5PoEefz.png"
    imagem:
      usar: true
      url: "https://i.imgur.com/TMHNcvD.png"
```

4. **Inicie o Bot**

   ```bash
   yarn start
   # ou
   npm run start
   ```

## Funcionamento

- O bot conecta-se ao Discord usando o token configurado.
- Verifica periodicamente novas entregas na API LojaSquare.
- Envia notificações no canal configurado do Discord.
- As notificações são configuráveis via `config.yml`, permitindo customização de mensagens e embeds.

## Contribuição

Sinta-se à vontade para contribuir com melhorias, correções de bugs ou novas funcionalidades. Faça um fork do repositório, crie uma branch para sua modificação e envie um pull request.
