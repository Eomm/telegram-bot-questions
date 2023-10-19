'use strict'

const cronParser = require('cron-parser')

const NEW_RETRO_STEPS = {
  new_retro_name: {
    field: 'name',
    message: 'What is the name of the retro?',
    validate: (value) => {
      const isValid = value.length > 0 && value.length <= 30
      if (isValid) {
        return { isValid }
      }
      return { isValid, errorMessage: 'The name must be between 1 and 30 characters long' }
    }
  },
  new_retro_gsheet: {
    field: 'google_sheet_id',
    message: (app, ctx) => {
      return `Provide the link to the Google Sheet that I should update\\.\nAdd the bot email: \`${ctx.escapeMarkdown(app.serviceAccountEmail)}\` as editor`
    },
    validate: (value) => {
      const gSheetId = getGoogleSheetId(value)
      const isValid = /^[a-zA-Z0-9-_]{44}$/i.test(gSheetId)
      if (isValid) {
        return { isValid, newValue: gSheetId }
      }
      return { isValid, errorMessage: 'Past a valid Google Sheet URL or ID' }
    }
  },
  new_retro_questions: {
    field: 'questions',
    message: 'What are the questions for the retro? \\(every question must be prefixed by the \\# symbol\\)',
    validate: (value) => {
      const questions = value.split('#').map(line => line.trim()).filter(line => line.length > 0)
      const isValid = questions.length > 0
      if (isValid) {
        return { isValid, newValue: { list: questions } }
      }
      return { isValid, errorMessage: 'Please add at least one question' }
    }
  },
  new_retro_cron: {
    field: 'cron',
    message: 'What is the cron expression for the retro? \\(ex `0 9 * * 1-5` for every weekday at 9:00 UTC\\)',
    validate: (value) => {
      try {
        cronParser.parseExpression(value)
        return { isValid: true }
      } catch (error) {
        return { isValid: false, errorMessage: 'Invalid cron expression' }
      }
    }
  },
  new_retro_code: {
    field: 'code',
    message: 'What is the code of the retro? \\(4\\-30 characters long and can only contain letters, numbers, dashes, underscores and dots\\)',
    validate: (value) => {
      const isValid = /^[a-z0-9-_.]{4,30}$/i.test(value)
      if (isValid) {
        return { isValid }
      }
      return { isValid, errorMessage: 'The code has an invalid format' }
    }
  }
}

const orderedSteps = Object.keys(NEW_RETRO_STEPS)
Object.entries(NEW_RETRO_STEPS).forEach(([key, value], i) => {
  const nextStep = orderedSteps[i + 1]
  value.step = key
  value.next = NEW_RETRO_STEPS[nextStep]
})

module.exports = { NEW_RETRO_STEPS }

function getGoogleSheetId (value) {
  if (typeof value === 'string' && value.length === 44) {
    return value
  } else if (value.length > 44) {
    return value.split('/').find(part => part.length === 44)
  }
  return ''
}
