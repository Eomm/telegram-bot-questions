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
    waitForHealthPolling: 2_000,
    onUnhandledError: async (err, ctx) => {
      app.log.error(err, `Ooops, encountered an error for "${ctx.updateType}"`)
      await ctx.reply('🙈 Ooops, something went wrong')
    }
  })

  await configureBot(app, app.bot)
}
