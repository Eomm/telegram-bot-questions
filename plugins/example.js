/// <reference path="../global.d.ts" />
'use strict'

const fastifyTelegram = require('@eomm/fastify-telegram')

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

  app.bot.on('text', (ctx) => ctx.reply('Hello World 2!!!!'))
}
