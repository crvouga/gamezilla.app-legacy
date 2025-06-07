import { IContentModeration } from '~/@/content-moderation/content-moderation'
import { IPuzzleDb } from './interface'

export const WithContentModeration = (puzzleDb: IPuzzleDb, contentModeration: IContentModeration): IPuzzleDb => {
  contentModeration.isBad('test')
  return puzzleDb
}
