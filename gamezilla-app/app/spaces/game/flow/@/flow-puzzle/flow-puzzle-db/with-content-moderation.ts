import {IContentModeration} from 'gamezilla-app/app/@/content-moderation/content-moderation';
import {IFlowPuzzleDb} from './flow-puzzle-db';

export const WithContentModeration = (
	flowPuzzleDb: IFlowPuzzleDb,
	contentModeration: IContentModeration,
): IFlowPuzzleDb => {
	contentModeration.isBad('test');
	return flowPuzzleDb;
};
