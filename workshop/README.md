# Telegram Bot Workshop

In this workshop, you will learn to create a Telegram bot integrated with Google and deployed on Platformatic.

## Step 0: Check the requirements

- Check the requirements listed in the [README.md](../README.md) file
- Run the `workshop/assets/self-checkup.sh` script to check the requirements:

```sh
curl -s -O https://raw.githubusercontent.com/Eomm/telegram-bot-questions/main/workshop/assets/self-checkup.sh
chmod +x ./self-checkup.sh
```

- Try to fix the errors and ask for help if you need it!

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

✅ It should be running on http://localhost:3042


## Step 2: Integrate with Telegram

- Start a chat with [@BotFather](https://t.me/BotFather)
- Execute the `/newbot` command
- Choose a name for your bot (e.g. `My Retro Bot`)
- Choose a username for your bot (e.g. `eommQuestionsBot`)
- Copy the into the `.env` file next to the `PLT_TELEGRAM_BOT_TOKEN` variable
- Install: `npm i @eomm/fastify-telegram`
- Rename `plugins/example.js` to `plugins/telegram.js`
- Configure the `@eomm/fastify-telegram`
- Add the following code to the `plugins/telegram.js` file:

```js
// ...
app.bot.on('text', async (ctx) => {
  await ctx.reply('Hello World!')
})
  // ...
```

  - Start the application: `npm start`

✅ Send a message to your bot and it should reply with `Hello World!`


## Step 3: Integrate with Google Sheets

- Download the [creation script][gcloud-cred]

```sh
curl -s -O https://raw.githubusercontent.com/Eomm/telegram-bot-questions/main/workshop/assets/create-gcloud.sh
chmod +x ./create-gcloud.sh
```

- Edit the script variables
- Run the script: `./create-gcloud.sh`

✅ It should configure a new Google Cloud project and create a new Service Account

- Install: `npm i google-spreadsheet google-auth-library`
- Create a new file `plugins/google-sheet.js`
- Download the [plugin file][google-sheet-plugin] and let's analyze it together
- Create an empty Google Sheets spreadsheet in a personal Google Drive account
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

❌ It should reply with an error

- Open the spreadsheet and share it with the Service Account email
- Send a message to your bot

✅ It should update the spreadsheet with the message


## Step 4: Implement the bot logic

- Let's [analyze the requirements][bot-logic] together
- Edit the `migrations/001.do.sql` file with the SQL schema
- Delete the `db.sqlite` and `schema.lock` files
- Start the PostgreSQL database
- Let's implement the logic! We will need:

```sh
npm i telegraf-safe-md-reply cron-parser fastify-cron
```

- Start the application: `npm start` and try it out!

✅ The bot should reply to your commands


## Step 5: Admin commands

- Implement a route to control the bot
- Enable authentication with JWT:
  - Edit the `platformatic.db.json > authorization`
  - Add the `PLT_JWT_SECRET` env variable
- Try it out with CURL and https://jwt.io/:

```sh
curl -X POST http://localhost:3001/execute/retro/<retro code> -H "Content-Type: application/json" -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwiaWQiOiIyODMxMjU3MCJ9.ipd_7lVrLVG0By-sksQK8LUoYXzIaQvoWBE1rOuWCLw" -d '{}'
```

## Step 6: Deploy to Platformatic Cloud

- Create a new NEON database
- Create a new Platformatic Cloud project manually
- Create a GitHub repository
- Configure the GitHub repository secrets
  - The `PLT_BASE_URL` can be set after the first deployment
- Push the code to GitHub!

```sh
npm i -g neonctl
neonctl auth
neonctl db create --name retro
neonctl db list
echo "DATABASE_URL=$(neonctl connection-string --database-name retro --pooled)" >> .env
```

```sh
git init
git remote add origin <your-git-url>
git fetch
git reset --mixed origin/main
git push --force origin main
```

✅ The bot should work without starting it locally
❗️ Now the bot token is used by the deployed application, so if you start it locally it will disconnect the deployed one!


# Pitfalls

- The scheduled job within the source code is a bit tricky, prefer an external service
- The user can run a single retro at a time, but it can be improved
- Add all the features you want!


# Summary

Congratulations! 🎉
You have created a Telegram bot integrated with Google Sheets and deployed on Platformatic Cloud!

There is a lot of room for improvements, so feel free to play with it and make it yours!
If you have any questions, you can reach me on [Twitter](https://twitter.com/ManuEomm).
If you want to learn more about Fastify, I wrote a [book](https://backend.cafe/the-fastify-book-is-out) about it!

[gcloud-cred]: https://github.com/Eomm/telegram-bot-questions/blob/main/workshop/assets/create-gcloud.sh
[google-sheet-plugin]: https://github.com/Eomm/telegram-bot-questions/blob/main/plugins/google-sheet.js
[bot-logic]: https://docs.google.com/presentation/d/1ViSd4t2PCC3PcZMzwaL1WuzgLUCmt071zo-vZA8U5gM/edit?usp=sharing
