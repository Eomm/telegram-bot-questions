'use strict'

const { join } = require('node:path')
const { readFile } = require('node:fs/promises')
const { buildServer } = require('@platformatic/db')

const os = require('node:os')
const path = require('node:path')
const fs = require('node:fs/promises')

let counter = 0


async function getServer (t) {

  const dbPath = join(os.tmpdir(), 'db-' + process.pid + '-' + counter++ + '.sqlite')
  const connectionString = 'sqlite://' + dbPath

  const config = JSON.parse(await readFile(join(__dirname, '..', 'platformatic.db.json'), 'utf8'))
  // Add your config customizations here. For example you want to set
  // all things that are set in the config file to read from an env variable
  config.server.logger.level = 'warn'
  config.watch = false

  config.migrations.autoApply = true
  config.types.autogenerate = false
  config.db.connectionString = connectionString

  // Add your config customizations here
  const server = await buildServer(config)
  t.after(() => server.close())

  t.after(async () => {
    await fs.unlink(dbPath)
  })

  return server
}

module.exports.getServer = getServer
