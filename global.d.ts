import type { PlatformaticApp, PlatformaticDBMixin, PlatformaticDBConfig, Entity, Entities, EntityHooks } from '@platformatic/db'
import { EntityTypes, Retro,User,UserRetro } from './types'

declare module 'fastify' {
  interface FastifyInstance {
    getSchema<T extends 'Retro' | 'User' | 'UserRetro'>(schemaId: T): {
      '$id': string,
      title: string,
      description: string,
      type: string,
      properties: {
        [x in keyof EntityTypes[T]]: { type: string, nullable?: boolean }
      },
      required: string[]
    };
  }
}

interface AppEntities extends Entities {
  retro: Entity<Retro>,
    user: Entity<User>,
    userRetro: Entity<UserRetro>,
}

interface AppEntityHooks {
  addEntityHooks(entityName: 'retro', hooks: EntityHooks<Retro>): any
    addEntityHooks(entityName: 'user', hooks: EntityHooks<User>): any
    addEntityHooks(entityName: 'userRetro', hooks: EntityHooks<UserRetro>): any
}

declare module 'fastify' {
  interface FastifyInstance {
    platformatic: PlatformaticApp<PlatformaticDBConfig> &
      PlatformaticDBMixin<AppEntities> &
      AppEntityHooks
  }
}
