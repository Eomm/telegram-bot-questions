'use strict'
/**
 * @param {import('fastify').FastifyInstance} app
 * @param {import('telegraf').Telegraf} bot
 */
module.exports = function build (app, bot) {
  bot.command('start', async ctx => {
    await ctx.reply(`🎉 Get rid of the stress with Question Bot! 🎉
\n
🚀 Retrospective: configure your own retrospectives and invite your team to participate. The bot will take care of the rest!
\n
⏰ Reminders: configure the bot to send you reminders to answer the questions of your retrospectives.
\n
✏️ Answers: answer the questions of your retrospectives and see the answers of your team in your google sheet.
\n
Created by @ManuEomm for CodeEmotion Milan 2023
\n
Follow me on Twitter https://twitter.com/ManuEomm
\n
Source code at https://github.com/Eomm/telegram-bot-questions`)
  })
}
