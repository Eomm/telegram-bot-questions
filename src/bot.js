'use strict'

/**
 * @param {import('fastify').FastifyInstance} app
 * @param {import('telegraf').Telegraf} bot
 */
module.exports = function build (app, bot) {
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
}
