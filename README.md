# api.cujaunifesp.com

API dos sistemas do ecossistema CUJA DIGITAL.

🔗 Documentação da API: [https://api-cuja.readme.io/](https://api-cuja.readme.io/)

## Instalar e rodar o projeto

Rodar o projeto em sua máquina local ou codespace é uma tarefa extremamente simples.

### Dependências globais

Você precisa ter duas principais dependências instaladas:

- Node.js lts/hydrogen v18
- Docker Engine v17.12.0 com Docker Compose v1.24.1 (ou qualquer versão superior)

Utiliza `nvm` ou codespaces? Então pode executar `nvm install` na pasta do projeto para instalar e utilizar a versão mais apropriada do Node.js.

### Dependências locais

Então após baixar o repositório, não se esqueça de instalar as dependências locais do projeto:

```bash
npm install
```

### Rodar o projeto

Para rodar o projeto localmente, basta rodar o comando abaixo:

```bash
npm run dev
```

Isto irá automaticamente rodar serviços como Banco de dados (incluindo as Migrations), Servidor de Email e irá expor um Serviço Web (Frontend e API) no seguinte endereço:

```bash
http://localhost:3000/
```

Observações:

- Para derrubar todos os serviços, basta utilizar as teclas `CTRL+C`, que é o padrão dos terminais para matar processos.
- Você pode conferir o endereço dos outros serviços dentro do arquivo `.env` encontrado na raiz do projeto, como por exemplo o endereço e credenciais do Banco de Dados local.

## Rodar os testes

O primeiro passo antes de fazer qualquer alteração no projeto é rodar os testes de forma geral para se certificar que tudo está passando como esperado. Para rodar os testes você precisa deixar os serviços rodando em segundo plano e rodar os testes em seguida. Para isso execute os comandos abaixo em dois terminais separados:

```bash
# Terminal 1
npm run dev

# Terminal 2
npm run test
```

Você pode escolher deixar os testes rodando enquanto desenvolve (e rodando novamente a cada alteração), usando o comando abaixo:

```bash
# Terminal 1
npm run dev

# Terminal 2
npm run test:watch
```

Lembre-se de rodar os testes sempre antes e depois de terminar suas implementações e antes de fazer o pull request de suas alterações.

## Criar novas Migrations

Você pode utilizar o script `migration:create`, por exemplo:

```
npm run migration:create create-selection-service-tables
```

Isto irá resultar em:

```
Created migration -- ./infra/db/migrations/000000000_create-selection-service-tables.js
```

Caso esta nova migração esteja válida, ela será automaticamente executada na próxima vez que você rodar o comando `npm run dev`.

## Rodar migrations

Caso você queira rodar as migrations pendentes sem ter que rodar `npm run dev`, basta usar o comando:

```
npm run migration:up
```

Caso você queira desfazer a última migration, basta rodar:

```
npm run migration:undo
```

E para desfazer todas as migrations, basta rodar:

```
npm run migration:undo:all
```

## Verificando emails

O serviço de email local está disponível na porta 1080.
Para veririficar os emails enviados pelo servidor local acesse http://localhost:1080

## Rodando lint

Para garantir que o estilo do seu código está de acordo com os padrões do projeto você pode rodar o verificador:

```
npm run lint:check
```

Caso queira corrigir automaticamente os erros de estilização use:

```
npm run lint:fix
```

Entretanto, recomendamos fortemente o uso das extensões `Prettier`, `EditorConfig` e `ESLint` em seu editor de código para facilitar a correção de estilização.

## Commit das alterações

Após finalizar suas alterações e se certificar que todos os testes estão passando com o comando `npm test`, chegou a hora de fazer o commit das suas alterações.

Adicione normalmente os arquivos ao `git status` usando `git add` e depois, para ser auxiliado no padrão de commit que utilizamos, rode o comando abaixo e siga as instruções:

```bash
npm run commit
```

As mensagens de commit (exceto escopo) devem ser escritas em português
