import { EventSourced } from '~/@/event-sourced'
import { IKeyValueDb } from '~/@/key-value-db'
import { ILogger } from '~/@/logger'
import { Err, isErr, mapErr, Ok } from '~/@/result'
import { ISqlDbMigrationPolicy } from '~/@/sql-db-migration-policy/interface'
import { ISqlDb } from '~/@/sql-db/interface'
import { UnixMs } from '~/@/time/unix-ms'
import { SpaceId } from '~/app/@/data/space-id'
import { UserId } from '~/app/@/data/user-id'
import { Space } from '../space'
import { ISpaceDb } from './interface'
import { initSpaceDb } from './space-db-impl'
import { SpaceEntity } from './space-entity'
import { initSpaceProjectionDb } from './space-projection-db-impl'
import { SpaceProjectionEntity } from './space-projection-entity'
import { initSpaceProjectionUserDb } from './space-projection-user-db-impl'
import { SpaceProjectionUserEntity } from './space-projection-user-entity'

export type ImplSql = {
  t: 'sql-db'
  sqlDb: ISqlDb
  logger: ILogger
  kvDb: IKeyValueDb
  migrationPolicy: ISqlDbMigrationPolicy
}

const toSpaceProjectionUserPrimaryKey = (spaceId: SpaceId, userId: UserId) => `${spaceId}-${userId}`

const init = (config: ImplSql): ISpaceDb => {
  // Initialize the three separate db instances
  const spaceDb = initSpaceDb(config)
  const projectionDb = initSpaceProjectionDb(config)
  const projectionUserDb = initSpaceProjectionUserDb(config)

  // Compose them into the ISpaceDb interface
  return {
    extra: {},

    async query(queryInput) {
      // For queries by id, directly query the space table
      if (queryInput.where && 'column' in queryInput.where && queryInput.where.column === 'id') {
        const result = await spaceDb.query({
          where: queryInput.where,
          limit: queryInput.limit,
          offset: queryInput.offset,
        })

        if (isErr(result)) return result

        return Ok({
          entities: {
            items: result.value.entities.items.map((e) => e.space),
            total: result.value.entities.total,
            limit: result.value.entities.limit,
            offset: result.value.entities.offset,
          },
          related: {},
        })
      }

      // For other queries, query projections first to get matching space IDs
      const projectionQuery: any = {}

      if (queryInput.where) {
        const where = queryInput.where
        if ('column' in where) {
          if (where.column === 'hostId' || where.column === 'type') {
            projectionQuery.where = where
          } else if (where.column === 'userIds' && where.op === 'in') {
            // Query projection_user table to find spaces with matching users
            const userIds = (Array.isArray(where.value) ? where.value : []) as unknown as UserId[]
            const userQueryResults = await projectionUserDb.query({
              where: { op: 'in', column: 'userId', value: userIds },
            })

            if (isErr(userQueryResults)) return userQueryResults

            const spaceIds = [
              ...new Set(userQueryResults.value.entities.items.map((item) => item.spaceId)),
            ] as SpaceId[]

            if (spaceIds.length === 0) {
              return Ok({
                entities: { items: [], total: 0, limit: queryInput.limit ?? 0, offset: queryInput.offset ?? 0 },
                related: {},
              })
            }

            projectionQuery.where = { op: 'in', column: 'id', value: spaceIds }
          }
        } else if ('op' in where && where.op === 'and') {
          // Build AND query for projections
          const clauses = where.clauses.filter((c: any) => c.column === 'hostId' || c.column === 'type')
          if (clauses.length > 0) {
            projectionQuery.where = { op: 'and', clauses }
          }
        }
      }

      if (queryInput.limit) projectionQuery.limit = queryInput.limit
      if (queryInput.offset) projectionQuery.offset = queryInput.offset

      // Query projections to get matching space IDs
      const projectionResults = await projectionDb.query(projectionQuery)
      if (isErr(projectionResults)) return projectionResults

      const spaceIds = projectionResults.value.entities.items.map((p) => p.id)

      if (spaceIds.length === 0) {
        return Ok({
          entities: { items: [], total: 0, limit: queryInput.limit ?? 0, offset: queryInput.offset ?? 0 },
          related: {},
        })
      }

      // Query spaces with matching IDs
      const spaceResults = await spaceDb.query({
        where: { op: 'in', column: 'id', value: spaceIds },
      })

      if (isErr(spaceResults)) return spaceResults

      return Ok({
        entities: {
          items: spaceResults.value.entities.items.map((e) => e.space),
          total: spaceResults.value.entities.total,
          limit: queryInput.limit ?? 0,
          offset: queryInput.offset ?? 0,
        },
        related: {},
      })
    },

    liveQuery(queryInput, map) {
      // For simplicity, use polling-based approach by querying periodically
      // In a production system, you'd want proper reactive queries
      return spaceDb.liveQuery({ where: undefined }, (output) => {
        // This is a simplified implementation - ideally we'd filter based on queryInput
        if (isErr(output)) return map(output as any)

        const spaces = output.value.entities.items.map((e) => e.space)
        return map(
          Ok({
            entities: {
              items: spaces,
              total: spaces.length,
              limit: queryInput.limit ?? 0,
              offset: queryInput.offset ?? 0,
            },
            related: {},
          }),
        )
      })
    },

    async upsert(input) {
      for (const space of input.entities) {
        const spaceId = Space.toSpaceId(space)
        if (!spaceId) return Err({ message: 'Failed to get space ID' })

        const snapshot = EventSourced.toLatestSnapshot(space)

        // Upsert to space table
        const spaceEntity: SpaceEntity = {
          id: spaceId,
          createdAt: UnixMs.now(),
          updatedAt: UnixMs.now(),
          deletedAt: null,
          space,
        }

        const spaceResult = await spaceDb.upsert({ entities: [spaceEntity] })
        if (isErr(spaceResult)) return mapErr(spaceResult, (e) => e)

        // Upsert to projection table
        const projectionEntity: SpaceProjectionEntity = {
          id: spaceId,
          hostId: snapshot.type === 'initial' ? null : snapshot.hostId,
          gameId: snapshot.type === 'initial' ? null : (snapshot.game?.t ?? null),
          type: snapshot.type,
        }

        const projectionResult = await projectionDb.upsert({ entities: [projectionEntity] })
        if (isErr(projectionResult)) return mapErr(projectionResult, (e) => e)

        // Update projection_user table
        // First delete existing entries for this space
        await projectionUserDb.delete({
          where: { op: '=', column: 'spaceId', value: spaceId },
          limit: 1000,
          offset: 0,
        })

        // Then insert new entries
        const userIds = snapshot.type === 'initial' ? [] : Object.values(snapshot.users)
        if (userIds.length > 0) {
          const userEntities: SpaceProjectionUserEntity[] = userIds.map((userId) => ({
            id: toSpaceProjectionUserPrimaryKey(spaceId, userId),
            spaceId,
            userId,
          }))

          const userResult = await projectionUserDb.upsert({ entities: userEntities })
          if (isErr(userResult)) return mapErr(userResult, (e) => e)
        }
      }

      return Ok({ entities: input.entities })
    },

    async update(_input) {
      return Ok(null)
    },

    async delete(_input) {
      return Ok({ entities: [] })
    },
  }
}

export const ImplSql = {
  init,
}
