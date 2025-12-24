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
      const { where, limit, offset } = queryInput

      let finalWhere: Parameters<typeof spaceDb.query>[0]['where'] = undefined

      if (where?.op === 'in' && where.column === 'userIds') {
        // Handle both UserId[] and UserId[][] (flatten if needed)
        const userIdsRaw = where.value as unknown as UserId[] | UserId[][]
        const userIds =
          userIdsRaw.length > 0 && Array.isArray(userIdsRaw[0])
            ? (userIdsRaw as UserId[][]).flat()
            : (userIdsRaw as UserId[])
        const userResult = await projectionUserDb.query({
          where: { op: 'in', column: 'userId', value: userIds },
          limit: 1000,
          offset: 0,
        })
        if (isErr(userResult)) return mapErr(userResult, (e) => e)
        const spaceIds = [...new Set(userResult.value.entities.items.map((e) => e.spaceId))]
        finalWhere =
          spaceIds.length > 0 ? { op: 'in', column: 'id', value: spaceIds } : { op: 'in', column: 'id', value: [] }
      } else if (where?.op === '=' && where.column === 'hostId') {
        // Query projection table first to get spaceIds by hostId
        const hostId = where.value as UserId
        const projectionResult = await projectionDb.query({
          where: { op: '=', column: 'hostId', value: hostId },
          limit: 1000,
          offset: 0,
        })
        if (isErr(projectionResult)) return mapErr(projectionResult, (e) => e)
        const spaceIds = projectionResult.value.entities.items.map((e) => e.id)
        finalWhere =
          spaceIds.length > 0 ? { op: 'in', column: 'id', value: spaceIds } : { op: 'in', column: 'id', value: [] }
      } else if (where?.op === '=' && where.column === 'id') {
        finalWhere = { op: '=', column: 'id', value: where.value }
      } else if (where?.op === 'in' && where.column === 'id') {
        finalWhere = { op: 'in', column: 'id', value: where.value }
      } else if (where) {
        // For other query types (type), we'd need to query projection table first
        // For now, return empty result
        finalWhere = { op: 'in', column: 'id', value: [] }
      }

      const spaceResult = await spaceDb.query({
        where: finalWhere,
        limit,
        offset,
      })

      if (isErr(spaceResult)) return mapErr(spaceResult, (e) => e)

      return Ok({
        entities: {
          items: spaceResult.value.entities.items.map((e) => e.space),
          total: spaceResult.value.entities.total,
          limit: spaceResult.value.entities.limit,
          offset: spaceResult.value.entities.offset,
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
