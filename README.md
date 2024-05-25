# Bot de Notificação de Entregas

Este projeto é um bot de Discord simplessississsissssssiimo para notificação de entregas realizadas por meio da API LojaSquare. Ele verifica periodicamente novas entregas e envia notificações no canal configurado do Discord.

## Estrutura do Projeto

- **src/**: Contém o código-fonte do projeto.

  - **api/**: Contém a integração com a API LojaSquare.
    - `lojasquare.ts`
  - **db/**: Contém a configuração e a conexão com o banco de dados.
    - `database.ts`
  - **embeds/**: Contém a configuração das mensagens de embed do Discord.
    - `entregaEmbeds.ts`
  - **services/**: Contém os serviços principais do bot.
    - `entregaService.ts`
  - `index.ts`: Arquivo principal que inicializa o bot.

- **config.yml**: Arquivo de configuração que contém todas as variáveis necessárias para o funcionamento do bot.

## Configuração

### Pré-requisitos

- Node.js
- Yarn ou npm
- MariaDB ou MySQL (Pode ser PHPMYADMIN da vida, normalmente as hospedagens dão de graça.)

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

      <summary>Edite o arquivo `config.yml` com suas configurações:</summary>
   <details>
      ```yaml
      # config.yml

   # Configurações do Discord

   discord:
   token: "SEU_DISCORD_TOKEN_AQUI"
   channel_id: "SEU_DISCORD_CHANNEL_ID_AQUI"

   # Configurações da API LojaSquare

   lojasquare:
   api_secret: "SEU_LOJASQUARE_API_SECRET_AQUI"

   # Configurações do Banco de Dados

   database:
   host: "SEU_DB_HOST_AQUI"
   user: "SEU_DB_USER_AQUI"
   password: "SEU_DB_PASSWORD_AQUI"
   name: "SEU_DB_DATABASE_AQUI"

   # Mensagens e Embeds

   mensagens: # Mensagens de notificação de entrega
   notificacao_entrega:
   titulo_sucesso: "Entrega Realizada com Sucesso!"
   titulo_multiplas: "Entregas Realizadas com Sucesso!"
   campos:
   produto:
   nome: "Produto"
   inline: true
   desconhecido: "Desconhecido"
   mostrar: true
   quantidade:
   nome: "Quantidade"
   inline: true
   desconhecido: "0"
   mostrar: true
   player:
   nome: "Player"
   inline: true
   desconhecido: "Desconhecido"
   mostrar: true
   servidor:
   nome: "Servidor"
   inline: true
   desconhecido: "Desconhecido"
   mostrar: true
   subservidor:
   nome: "SubServidor"
   inline: true
   desconhecido: "Desconhecido"
   mostrar: true
   codigo:
   nome: "Código"
   inline: true
   desconhecido: "Desconhecido"
   mostrar: true
   status:
   nome: "Status"
   inline: true
   desconhecido: "Desconhecido"
   mostrar: true
   atualizado_em:
   nome: "Atualizado Em"
   inline: true
   desconhecido: "Desconhecido"
   mostrar: true
   cor: "Green"
   footer:
   usar: true
   texto: "Notificação gerada automaticamente"
   icone_url: "URL_DO_ICONE_DO_FOOTER"
   </details>

   # Configuração do tempo de busca

   tempo_busca:
   intervalo_segundos: 60

   ```

   As principais configurações são:

   - **Discord Token**: O token do seu bot do Discord.
   - **Discord Channel ID**: O ID do canal do Discord onde as notificações serão enviadas.
   - **LojaSquare API Secret**: A chave secreta da API LojaSquare.
   - **Banco de Dados**: Configurações do banco de dados (host, usuário, senha, nome).
   - **Mensagens e Embeds**: Configurações das mensagens de notificação e embeds do Discord.
   - **Tempo de Busca**: Intervalo de tempo (em segundos) para busca de novas entregas (mínimo de 60 segundos).

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
