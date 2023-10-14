/// <reference path="../global.d.ts" />
'use strict'

const fastifyTelegram = require('@eomm/fastify-telegram')
const { GoogleSpreadsheet } = require('google-spreadsheet')
const { JWT } = require('google-auth-library')

/** @param {import('fastify').FastifyInstance} app */
module.exports = async function (app, opts) {
  const token = app.platformatic.configManager.env.PLT_TELEGRAM_BOT_TOKEN

  await app.register(fastifyTelegram, {
    botToken: token,
    baseUrl: undefined,
    decoratorBotName: 'bot',
    onUnhandledError: (err, ctx) => {
      console.log(`Ooops, encountered an error for ${ctx.updateType}`, err)
    }
  })

  const credBase64 = app.platformatic.configManager.env.PLT_GCP_CREDENTIALS
  const creds = JSON.parse(Buffer.from(credBase64, 'base64').toString('utf8'))

  const SCOPES = [
    'https://www.googleapis.com/auth/spreadsheets',
    'https://www.googleapis.com/auth/drive.file'
  ]

  const jwtFromEnv = new JWT({
    email: creds.client_email,
    key: creds.private_key,
    scopes: SCOPES
  })

  app.bot.on('text', async (ctx) => {
    await ctx.reply('Hello World 2!!!!')

    // https://docs.google.com/spreadsheets/d/15wylDyvCesqzoko3_-PGqgm22VaT7-0F58jv520-oNQ/edit?usp=sharing

    const doc = new GoogleSpreadsheet('15wylDyvCesqzoko3_-PGqgm22VaT7-0F58jv520-oNQ', jwtFromEnv)

    try {
      await doc.loadInfo()
      console.log('titiel===' + doc.title)

      const title = 'bot'
      let sheet = doc.sheetsByTitle[title]
      if (!sheet) {
        sheet = await doc.addSheet({ title })
      }

      try {
        await sheet.loadHeaderRow(1)
      } catch (error) {
        await sheet.setHeaderRow([
          'id',
          'username',
          'text'
        ], 1)
      }

      await sheet.addRow([
        ctx.message.from.id,
        ctx.message.from.username,
        ctx.message.text
      ], { insert: true })

      await ctx.reply('Done')
    } catch (axiosError) {
      console.error(axiosError)

      if (axiosError.response?.status === 403) {
        await ctx.reply('Please share the spreadsheet with the bot email: ' + creds.client_email)
      }
    }
  })
}
