'use strict'

const { message } = require('telegraf/filters')
const { NEW_RETRO_STEPS } = require('./new-retro-flow')

/**
 * @param {import('fastify').FastifyInstance} app
 * @param {import('telegraf').Telegraf} bot
 */
module.exports = function build (app, bot) {
  bot.command('newretro', async ctx => {
    const { user } = ctx

    const initStep = NEW_RETRO_STEPS.new_retro_name

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

    const currentStep = NEW_RETRO_STEPS[user.currentAction]
    if (!currentStep || ctx.message.text.startsWith('/')) {
      // skip this middleware if user is not creating a new retro
      return next()
    }

    const validationResult = currentStep.validate(ctx.message.text)
    if (!validationResult.isValid) {
      app.log.debug('Invalid value: [%s]', ctx.message.text)
      return ctx.reply(validationResult.errorMessage || 'Invalid value')
    }

    const nextStep = currentStep.next
    if (nextStep) {
      // The process is not finished yet, ask for the next step
      await app.platformatic.entities.user.save({
        input: {
          id: user.id,
          currentAction: nextStep.step,
          currentActionData: {
            ...user.currentActionData,
            [currentStep.field]: validationResult.newValue || ctx.message.text
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
