'use strict'

const { message } = require('telegraf/filters')
const cronParser = require('cron-parser')

let stepId = 0
const NEW_RETRO_STEPS = [
  {
    i: stepId++,
    step: 'new_retro_name',
    field: 'name',
    message: 'What is the name of the retro?'
  },
  {
    i: stepId++,
    step: 'new_retro_gsheet',
    field: 'google_sheet_id',
    message: (app, ctx) => {
      return 'What is the Google Sheet the bot should update? Remember to share the sheet with the bot email: ' + ctx.escapeMarkdown(app.serviceAccountEmail)
    },
    validate: (value) => {
      const id = getGoogleSheetId(value)
      return /^[a-zA-Z0-9-_]{44}$/i.test(id)
    },
    rewriteText: (value) => { return getGoogleSheetId(value) },
    invalidMessage: 'Past a valid Google Sheet URL or ID'
  },
  {
    i: stepId++,
    step: 'new_retro_questions',
    field: 'questions',
    message: 'What are the questions for the retro? \\(every question must be prefixed by the \\# symbol\\)',
    validate: (value) => {
      const questions = value.split('#').map(line => line.trim()).filter(line => line.length > 0)
      return questions.length > 0
    },
    rewriteText: (value) => {
      const questions = value.split('#').map(line => line.trim()).filter(line => line.length > 0)
      return { list: questions }
    },
    invalidMessage: 'Invalid question list'
  },
  {
    i: stepId++,
    step: 'new_retro_cron',
    field: 'cron',
    message: 'What is the cron expression for the retro? \\(ex `0 9 * * 1-5` for every weekday at 9:00 UTC\\)',
    validate: (value) => {
      try {
        cronParser.parseExpression(value)
        return true
      } catch (error) {
        return false
      }
    },
    invalidMessage: 'Invalid cron expression'
  },
  {
    i: stepId++,
    step: 'new_retro_code',
    field: 'code',
    message: 'What is the code of the retro? \\(4\\-30 characters long and can only contain letters, numbers, dashes, underscores and dots\\)',
    validate: (value) => /^[a-z0-9-_.]{4,30}$/i.test(value),
    invalidMessage: 'The code is Invalid'
  }
]

/**
 * @param {import('fastify').FastifyInstance} app
 * @param {import('telegraf').Telegraf} bot
 */
module.exports = function build (app, bot) {
  bot.command('newretro', async ctx => {
    const { user } = ctx

    const initStep = NEW_RETRO_STEPS[0]

    await app.platformatic.entities.user.save({
      input: {
        id: user.id,
        currentAction: initStep.step,
        currentActionData: {},
        updatedAt: new Date()
      }
    })

    await ctx.reply(initStep.message)
  })

  bot.on(message('text'), async (ctx, next) => {
    const user = ctx.user

    const currentStep = NEW_RETRO_STEPS.find(step => step.step === user.currentAction)
    if (!currentStep || ctx.message.text.startsWith('/')) {
      // skip this middleware if user is not creating a new retro
      return next()
    }

    const validationResult = currentStep.validate?.(ctx.message.text)
    if (validationResult === false) {
      app.log.debug('Invalid value: [%s]', ctx.message.text)
      return ctx.reply(currentStep.invalidMessage || 'Invalid value')
    }

    const nextStep = NEW_RETRO_STEPS[currentStep.i + 1]
    if (nextStep) {
      // The process is not finished yet, ask for the next step
      await app.platformatic.entities.user.save({
        input: {
          id: user.id,
          currentAction: nextStep.step,
          currentActionData: {
            ...user.currentActionData,
            [currentStep.field]: currentStep.rewriteText?.(ctx.message.text) || ctx.message.text
          },
          updatedAt: new Date()
        }
      })

      const msg = typeof nextStep.message === 'function' ? nextStep.message(app, ctx) : nextStep.message
      return ctx.replyWithMarkdownV2(msg)
    }

    const retroItem = {
      ...user.currentActionData,
      [currentStep.field]: ctx.message.text,
      createdBy: user.id
    }

    try {
      app.log.info('Creating new retro: %s', retroItem.code)
      await app.platformatic.db.tx(async tx => {
        const [result] = await app.platformatic.entities.retro.insert({
          tx,
          fields: ['id', 'code', 'cron', 'googleSheetId', 'questions'],
          inputs: [retroItem]
        })

        await app.platformatic.entities.user.save({
          tx,
          input: {
            id: user.id,
            currentAction: null,
            currentActionData: null,
            updatedAt: new Date()
          }
        })

        await app.platformatic.entities.userRetro.insert({ tx, inputs: [{ userId: user.id, retroId: result.id }] })

        // Prepare the Google Sheet
        const doc = await app.getSpreadsheet(result.googleSheetId)
        await app.getQuestionsSheet(doc, [
          'Date',
          'User',
          ...result.questions.list
        ])

        app.startRetroCronJob(result)
      })

      await ctx.reply('✅ Done!')
    } catch (error) {
      if (error.code === '23505') {
        return ctx.reply('The code is already in use, please choose another one')
      }

      if (error.response?.status === 403) {
        app.log.warn(error)
        return ctx.reply(`Please share the spreadsheet with the bot email (${app.serviceAccountEmail}) and retry to sent the code`)
      }

      throw error
    }
  })
}

function getGoogleSheetId (value) {
  if (typeof value === 'string' && value.length === 44) {
    return value
  } else if (value.length > 44) {
    return value.split('/').find(part => part.length === 44)
  }
  return ''
}
