import { cast, destroy, detach, Instance, types } from 'mobx-state-tree';

import { EntityStore, formTypes } from '@westech/unit';
import { currentOrganization, logger } from '@westech/utils';
import {
	AddNodeArgs,
	AddNodeStrategy,
} from '../../../components/journey-visual/interfaces';
import { JourneyNodeType } from '../../common/enums/journey-node-type';
import { addNode } from './journey-node/actions/add-node';
import { applySyncOperations } from './journey-node/actions/apply-sync-operations';
import { removeNode } from './journey-node/actions/remove-node';
import {
	shiftBranch,
	shiftBranches,
} from './journey-node/actions/shift-branch';
import { NodeSyncOperations, ShiftDirection } from './journey-node/interfaces';
import { JourneyNode } from './journey-node/store';
import { SubmitOptions } from './journey-node/submit-options/store';
import { arrowIndexProvider } from './journey-node/utils/arrow-index-provider';
import { syncEmail } from './journey-node/utils/email-segments-sync/email-sync';
import { nodePath } from './journey-node/utils/node-path';
import { optionLoader } from './option-loader';
import { QueryParameter } from './query-parameter/store';

export interface Journey extends Instance<typeof Journey> {}
export const Journey = EntityStore.named('JourneyVisual')
	.props({
		journeyNodes: types.optional(types.array(JourneyNode), [
			{ path: nodePath.first },
		]),
		name: formTypes.string,
		whatAreYouPromotingIds: types.frozen<string[]>([]),
		queryParameters: types.optional(types.array(QueryParameter), [{}]),
		organizationId: types.optional(types.string, currentOrganization.id()),
	})
	.views(self => ({
		hasNode: (path: string): boolean => {
			return self.journeyNodes.some(x => x.path === path);
		},
	}))
	.volatile(optionLoader)
	.actions(self => ({
		addPageEmailBlocks: (
			path: string,
			pageIndex: number,
			emailIndex: number,
		) => {
			addNode(self.journeyNodes, {
				parentNodePath: path,
				arrowIndex: pageIndex,
				nodeType: JourneyNodeType.Page,
				strategy: AddNodeStrategy.AddIfNotExists,
			});
			addNode(self.journeyNodes, {
				parentNodePath: path,
				arrowIndex: emailIndex,
				nodeType: JourneyNodeType.Email,
				strategy: AddNodeStrategy.AddIfNotExists,
			});
		},
	}))
	.actions(self => ({
		addNode: (addNodeArgs: AddNodeArgs) =>
			addNode(self.journeyNodes, addNodeArgs),
		removeNode: (path: string) => removeNode(self.journeyNodes, path),
		shiftBranch: shiftBranch(self.journeyNodes),
		shiftBranches: (oldPath: string, direction: ShiftDirection): void =>
			shiftBranches(self as Journey, oldPath, direction),
		removeBranches: (pathPatterns: string[]) => {
			pathPatterns.forEach(pathPattern => {
				logger.info(`remove branch: ${pathPattern}*`);
				const nodesToRemove = self.journeyNodes.filter(node =>
					node.path.startsWith(pathPattern),
				);
				nodesToRemove.forEach(destroy);
			});
		},
		applySyncOperations: (syncOperations: NodeSyncOperations): void =>
			applySyncOperations(self as Journey, syncOperations),
		onFormSegmentsAdded: (path: string, submitOptions: SubmitOptions[]) => {
			submitOptions.forEach((_, index) => {
				const arrowIndexes = arrowIndexProvider.fromFormSegmentOnPage(
					submitOptions,
					index,
				);

				self.addPageEmailBlocks(
					path,
					arrowIndexes.pageArrowIndex,
					arrowIndexes.primaryMediaOutletArrowIndex,
				);
			});
		},
		addFollowingFormNodes: () => {
			const arrowIndexes = arrowIndexProvider.fromForm();

			self.addPageEmailBlocks(
				nodePath.first,
				arrowIndexes.pageArrowIndex,
				arrowIndexes.primaryMediaOutletArrowIndex,
			);
		},
		onEmailSegmentsAdded: (journeyNode: JourneyNode) => {
			syncEmail(journeyNode, self.journeyNodes);
		},
	}))
	.actions(self => ({
		setWhatYouPromoting: (whatYouPromoting: string[]) =>
			(self.whatAreYouPromotingIds = whatYouPromoting),
	}))
	.actions(self => ({
		addQueryParameter: (afterIndex: number) => {
			self.queryParameters.splice(afterIndex + 1, 0, {});
		},
		setName: (name: string) => (self.name = name),
		removeQueryParameter: detach,
		afterCreate: () => {
			self.queryParameters = self.queryParameters.length
				? self.queryParameters
				: cast([{}]);
		},
	}));
