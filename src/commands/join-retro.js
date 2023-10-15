'use strict'

const { message } = require('telegraf/filters')

const JOIN_EVENT_STEP = 'join_event'

/**
 * @param {import('fastify').FastifyInstance} app
 * @param {import('telegraf').Telegraf} bot
 */
module.exports = function build (app, bot) {
  bot.command('joinretro', async ctx => {
    const { user } = ctx

    await app.platformatic.entities.user.save({
      input: {
        id: user.id,
        currentAction: JOIN_EVENT_STEP,
        currentActionData: {},
        updatedAt: new Date()
      }
    })

    await ctx.reply('Please enter the retro code..')
  })

  bot.on(message('text'), async (ctx, next) => {
    const user = ctx.user

    if (user.currentAction !== JOIN_EVENT_STEP || ctx.message.text.startsWith('/')) {
      // skip this middleware
      return next()
    }

    const retroCode = ctx.message.text

    const [retro] = await app.platformatic.entities.retro.find({
      fields: ['id', 'name'],
      where: { code: { eq: retroCode } }
    })

    if (!retro) {
      return ctx.replyWithMarkdownV2(`The retro code *${ctx.escapeMarkdown(retroCode)}* is invalid`)
    }

    await app.platformatic.db.tx(async tx => {
      await app.platformatic.entities.userRetro.save({
        tx,
        input: {
          userId: user.id,
          retroId: retro.id
        }
      })

      await app.platformatic.entities.user.save({
        input: {
          id: user.id,
          currentAction: null,
          currentActionData: null,
          updatedAt: new Date()
        }
      })
    })

    await ctx.replyWithMarkdownV2(`✅ Joined the retro: *${ctx.escapeMarkdown(retro.name)}*`)
  })
}
