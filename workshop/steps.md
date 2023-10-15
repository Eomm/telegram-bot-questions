
## Step 0

- Check the requirements
- Create a new project folder
- Create an empty `.env` file

- Install gcloud https://cloud.google.com/sdk/docs/install-sdk

## Step 1: Generate the Platformatic scaffolding

- Create a new Platformatic project running `npm create -y platformatic@1` choosing the following options:
  1. Which kind of project do you want to create? _DB_
  1. Where would you like to create your project? _my-telegram-bot_
  1. What database do you want to use? _SQLite_
  1. Do you want to use the connection string "sqlite://./db.sqlite"? _Confirm_
  1. What port do you want to use? _3042_
  1. Do you want to run npm install? _yes_
  1. Do you want to create default migrations? _yes_
  1. Do you want to apply migrations? _yes_
  1. Do you want to create a plugin? _yes_
  1. Do you want to use TypeScript? _no_
  1. Do you want to create the github action to deploy this application to Platformatic Cloud? _yes_
  1. Do you want to enable PR Previews in your application? _no_
- Move into the project: `cd ./my-telegram-bot`
- Start the application: `npm start`

👍 It should be running on http://localhost:3042

## Step 2: Integrate with Telegram

- Start a chat with [@BotFather](https://t.me/BotFather)
- Execute the `/newbot` command
- Choose a name for your bot (e.g. `My Retro Bot`)
- Choose a username for your bot (e.g. `eommQuestionsBot`)
- Copy the into the `.env` file next to the `PLT_TELEGRAM_BOT_TOKEN` variable
- Install: `npm i @eomm/fastify-telegram`
- Rename `plugins/example.js` to `plugins/telegram.js`
- Configure the `@eomm/fastify-telegram`
- Add the following code to the `plugins/telegram.js` file
- Start the application: `npm start`

```js
app.bot.on('text', async (ctx) => {
  await ctx.reply('Hello World!')
})
```

👍 Send a message to your bot and it should reply with `Hello World!`

## Step 3: Integrate with Google Sheets

- Download the [creation script][gcloud-cred]
- Edit the script variables
- Run the script: `./create-gcloud.sh` (be sure it has execution permissions `chmod +x ./create-gcloud.sh`)

👍 It should configure a new Google Cloud project and create a new Service Account

- Install: `npm i google-spreadsheet google-auth-library`
- Create a new file `plugins/google-sheet.js`
- Download the [plugin file][google-sheet-plugin] and let's analyze it together
- Create an empty spreadsheet in Google Sheets
- Edit the `plugins/telgram.js` file and add the following code:

```js
app.bot.on('text', async (ctx) => {
  try {
    const doc = await app.getSpreadsheet('YOUR-SPREADSHEET-ID')
    const sheet = await app.getQuestionsSheet(doc, ['id', 'username', 'text'])

    await sheet.addRow([
      ctx.message.from.id,
      ctx.message.from.username,
      ctx.message.text
    ], { insert: true })

    await ctx.reply('Done')
  } catch (error) {
    if (error.response?.status === 403) {
      app.log.warn(error)
      await ctx.reply('Please share the spreadsheet with the bot email: ' + app.serviceAccountEmail)
    } else {
      app.log.error(error)
      await ctx.reply('Ooops, something went wrong')
    }
  }
})
```

- Start the application: `npm start`
- Send a message to your bot

👎 It should reply with an error

- Open the spreadsheet and share it with the Service Account email
- Send a message to your bot

👍 It should update the spreadsheet with the message

---

## Step 4: Implement the bot logic

- Let's [analyze the requirements][bot-logic] together
- Edit the `migrations/001.do.sql` file with the SQL schema
- Delete the `db.sqlite` and `schema.lock` files
- Let's implement the logic!
- Start the application: `npm start`

👍 The bot should reply to your commands

---

## Step 5: Deploy to Platformatic Cloud

- Create a new NEON database
- Create a new Platformatic Cloud project
- Create a GitHub repository
- Configure the GitHub repository secrets
- Push the code to GitHub!

```
git init
git remote add origin your-git-url
git fetch
git reset --mixed origin/master
```

```
npm i -g neonctl
neonctl auth
neonctl db create --name retro
neonctl db list
echo "DATABASE_URL=$(neonctl connection-string --database-name retro --pooled)" >> .env
```

👍 The bot should work without starting it locally
❗️ Now the bot token is used by the deployed application, so if you start it locally it will disconnect the deployed one!

[gcloud-cred]: http://todo.it/sh-file
[google-sheet-plugin]: http://todo.it/source
[bot-logic]: http://todo.it/slides
