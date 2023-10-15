/// <reference path="../global.d.ts" />
'use strict'

const fastifyTelegram = require('@eomm/fastify-telegram')
const configureBot = require('../src/bot')

/** @param {import('fastify').FastifyInstance} app */
module.exports = async function telegramBotPlugin (app, opts) {
  await app.register(fastifyTelegram, {
    botToken: app.platformatic.configManager.env.PLT_TELEGRAM_BOT_TOKEN,
    baseUrl: app.platformatic.configManager.env.PLT_BASE_URL,
    decoratorBotName: 'bot',
    onUnhandledError: (err, ctx) => {
      app.log.error(`Ooops, encountered an error for ${ctx.updateType}`, err)
    }
  })

  configureBot(app, app.bot)
}
