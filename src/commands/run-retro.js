'use strict'

'use strict'

const { message } = require('telegraf/filters')

const ANSWER_RETRO = 'answer_retro'

/**
 * @param {import('fastify').FastifyInstance} app
 * @param {import('telegraf').Telegraf} bot
 */
module.exports = function build (app, bot) {
  app.decorate('runRetro', (code) => runRetro(app, code))

  // TODO: on vocal message, transcribe it and save the text as answer

  bot.on(message('text'), async (ctx, next) => {
    const user = ctx.user

    if (user.currentAction !== ANSWER_RETRO || ctx.message.text.startsWith('/')) {
      // skip this middleware
      return next()
    }

    const [retro] = await app.platformatic.entities.retro.find({
      where: { id: { eq: user.currentActionData.runningRetroId } }
    })

    const nextQuestionIndex = user.currentActionData.questionNumber + 1
    const nextQuestion = retro.questions.list[nextQuestionIndex]

    if (nextQuestion) {
      // The retro is NOT finished
      await app.platformatic.entities.user.save({
        input: {
          id: user.id,
          currentActionData: {
            ...user.currentActionData,
            questionNumber: nextQuestionIndex,
            answers: user.currentActionData.answers.concat(ctx.message.text)
          },
          updatedAt: new Date()
        }
      })

      return ctx.reply(`${nextQuestionIndex + 1} of ${retro.questions.list.length}) ${nextQuestion}`)
    }

    // The retro is finished
    try {
      const allAnswers = user.currentActionData.answers.concat(ctx.message.text)
      const doc = await app.getSpreadsheet(retro.googleSheetId)
      const sheet = await app.getQuestionsSheet(doc)

      const sheetLine = [
        new Date(),
        user.fullName,
        ...allAnswers
      ]
      await sheet.addRow(sheetLine, { insert: true })

      await app.platformatic.entities.user.save({
        input: {
          id: user.id,
          currentAction: null,
          currentActionData: null,
          updatedAt: new Date()
        }
      })

      await ctx.reply('✅ Thanks for your answers!')
    } catch (error) {
      app.log.error(error)
      await ctx.reply('Ooops, something went wrong. Only your last answer was not saved. Retry later.')
    }
  })
}

async function runRetro (app, retroCode) {
  app.log.info('Running retro %s', retroCode)

  const [retro] = await app.platformatic.entities.retro.find({
    fields: ['id', 'name', 'questions', 'google_sheet_id'],
    where: { code: { eq: retroCode } }
  })

  if (!retro) {
    app.log.error('Missing retro code: %s', retroCode)
    return
  }

  const people = await app.platformatic.entities.userRetro.find({
    fields: ['userId'],
    where: { retroId: { eq: retro.id } }
  })

  const date = new Date().toISOString().split('T')[0]
  const firstQuestion = retro.questions.list[0]

  const sendMessages = people.map(async person => {
    await app.platformatic.entities.user.save({
      input: {
        id: person.userId,
        currentAction: ANSWER_RETRO,
        currentActionData: {
          runningRetroId: retro.id,
          questionNumber: 0,
          answers: []
        },
        updatedAt: new Date()
      }
    })

    return app.bot.telegram.sendMessage(person.userId, `🎬 RETRO ${date} - ${retro.name}\n\n1 of ${retro.questions.list.length}) ${firstQuestion}`)
  })

  try {
    await Promise.all(sendMessages)
  } catch (error) {
    app.log.error(error, 'Error sending messages for retro %s', retro.id)
  }
}
