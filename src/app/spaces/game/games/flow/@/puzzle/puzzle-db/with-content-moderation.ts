import { IContentModeration } from '~/@/content-moderation/content-moderation'
import { IPuzzleDb } from './interface'

export const WithContentModeration = (flowPuzzleDb: IPuzzleDb, contentModeration: IContentModeration): IPuzzleDb => {
  contentModeration.isBad('test')
  return flowPuzzleDb
}
