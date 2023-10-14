
## Step 0

- Check the requirements
- Create a new project folder
- Create an empty `.env` file

- Install gcloud https://cloud.google.com/sdk/docs/install-sdk

## Step 1: Get the Telegram Bot API Token

- Start a chat with [@BotFather](https://t.me/BotFather)
- Execute the `/newbot` command
- Choose a name for your bot (e.g. `My Retro Bot`)
- Choose a username for your bot (e.g. `eommQuestionsBot`)
- Copy the `TELEGRAM_BOT_TOKEN` into the `.env` file

## Step 2: Generate the Platformatic scaffold

- Create a new Platformatic project running `npm create -y platformatic@1` choosing the following options:
  1. Which kind of project do you want to create? _DB_
  1. Where would you like to create your project? _noop_
  1. What database do you want to use? _SQLite_
  1. Do you want to use the connection string "sqlite://./db.sqlite"? _Confirm_
  1. What port do you want to use? _3042_
  1. Do you want to run npm install? _no_
  1. Do you want to create default migrations? _yes_
  1. Do you want to apply migrations? _yes_
  1. Do you want to create a plugin? _yes_
  1. Do you want to use TypeScript? _no_
  1. Do you want to create the github action to deploy this application to Platformatic Cloud? _yes_
  1. Do you want to enable PR Previews in your application? _no_
- Move the files in the root folder:
  - Copy the `noop/.env` file content into the `.env` file
  - `mv noop/* ./`
  - `rm -rf noop/`
- Install the dependencies: `npm install`

## Step 3: Create the Production Database

```
npm i -g neonctl
neonctl auth
neonctl db create --name retro
neonctl db list
echo "DATABASE_URL=$(neonctl connection-string --database-name retro --pooled)" >> .env
```

## Step 4: The database schema

- Copy-paste the following schema into `migrations/001.do.sql`:

```sql
```