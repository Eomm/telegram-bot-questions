/// <reference path="../global.d.ts" />
'use strict'

const { GoogleSpreadsheet } = require('google-spreadsheet')
const { JWT } = require('google-auth-library')

/** @param {import('fastify').FastifyInstance} app */
module.exports = async function googleSheet (app, opts) {
  const credBase64 = app.platformatic.configManager.env.PLT_GCP_CREDENTIALS
  const creds = JSON.parse(Buffer.from(credBase64, 'base64').toString('utf8'))

  const jwtFromEnv = new JWT({
    email: creds.client_email,
    key: creds.private_key,
    scopes: [
      'https://www.googleapis.com/auth/spreadsheets',
      'https://www.googleapis.com/auth/drive.file'
    ]
  })

  app.decorate('serviceAccountEmail', creds.client_email)

  app.decorate('getSpreadsheet', async function (spreadsheetId) {
    const doc = new GoogleSpreadsheet(spreadsheetId, jwtFromEnv)
    await doc.loadInfo()
    return doc
  })

  app.decorate('getQuestionsSheet', async function (gdoc, columns, sheetTitle = 'bot') {
    let sheet = gdoc.sheetsByTitle[sheetTitle]
    if (!sheet) {
      sheet = await gdoc.addSheet({ title: sheetTitle })
    }

    try {
      await sheet.loadHeaderRow(1)
    } catch (error) {
      await sheet.setHeaderRow(columns, 1)
    }

    return sheet
  })
}
