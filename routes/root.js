/// <reference path="../global.d.ts" />
'use strict'
/** @param {import('fastify').FastifyInstance} app */
module.exports = async function (app, opts) {
  app.addHook('onRequest', async (request, reply) => {
    await request.jwtVerify()
  })

  app.post('/execute/retro/:code', async (request, reply) => {
    const [retro] = await app.platformatic.entities.retro.find({
      fields: ['id', 'name'],
      where: {
        code: { eq: request.params.code },
        createdBy: { eq: request.user.id }
      }
    })

    if (!retro) {
      const err = new Error('You can\'t access the requested retro!')
      err.statusCode = 401
      throw err
    }

    const startedSuccessfully = await app.runRetro(request.params.code)
    return { started: startedSuccessfully ?? false }
  })
}
