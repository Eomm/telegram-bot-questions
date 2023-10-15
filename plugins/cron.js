/// <reference path="../global.d.ts" />
'use strict'

const fastifyCron = require('fastify-cron')

/** @param {import('fastify').FastifyInstance} app */
module.exports = async function cronUtilsPlugin (app, opts) {
  app.register(fastifyCron)

  app.decorate('startRetroCronJob', function (retro) {
    app.log.info('Scheduling new cron job for retro %s [%s]', retro.id, retro.cron)
    app.cron.createJob({
      name: retro.id,
      cronTime: retro.cron,
      start: true,
      onTick: () => {
        app.runRetro(retro.code)
          .catch(err => {
            app.log.error(err, `Fatal error running retro ${retro.code}`)
          })
      }
    })
  })
}
