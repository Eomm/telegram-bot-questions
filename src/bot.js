'use strict'

const safeMarkdown = require('telegraf-safe-md-reply')

const registerCreateRetro = require('./commands/new-retro')
const registerJoinRetro = require('./commands/join-retro')

/**
 * @param {import('fastify').FastifyInstance} app
 * @param {import('telegraf').Telegraf} bot
 */
module.exports = function build (app, bot) {
  // Middleware to manage the user session
  bot.use(upsertUser) // add user to ctx
  bot.use(safeMarkdown()) // add markdown support to ctx.reply

  registerCreateRetro(app, bot)
  registerJoinRetro(app, bot)

  bot.on('text', async (ctx) => {
    await ctx.reply('Hello World!!!!')

    try {
      const doc = await app.getSpreadsheet('15wylDyvCesqzoko3_-PGqgm22VaT7-0F58jv520-oNQ')
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

  async function upsertUser (ctx, next) {
    const userId = ctx.update.message?.from.id || ctx.update.callback_query?.from.id
    const chatId = ctx.update.message?.chat.id || ctx.update.callback_query?.message?.chat.id

    const [user] = await app.platformatic.entities.user.find({
      where: { id: { eq: userId } }
    })

    if (user) {
      ctx.user = user
    } else {
      app.log.info('Creating new user', ctx.update.message.from)

      const fullName = ctx.update.message.from.first_name + (ctx.update.message.from.last_name ? ` ${ctx.update.message.from.last_name}` : '')
      const [newUser] = await app.platformatic.entities.user.insert({
        fields: ['id'],
        inputs: [
          {
            id: userId,
            chatId,
            fullName,
            username: ctx.update.message.from.username || userId,
            lang: ctx.update.message.from.language_code
          }
        ]
      })

      ctx.user = newUser
    }

    return next()
  }
}
