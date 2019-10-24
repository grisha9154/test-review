import {
	cast,
	flow,
	getParentOfType,
	hasParent,
	Instance,
	types,
} from 'mobx-state-tree';

import { async, formTypes, guid } from '@westech/unit';
import { Guid, logger } from '@westech/utils';
import { api } from '../../../../api';
import { SegmentList } from '../../../../components/journey-visual/visual-node/interfaces';
import { JourneyNodeType } from '../../../common/enums/journey-node-type';
import { Journey } from '../journey';
import { changeType } from './actions/change-type';
import { Creative, JourneyAction, JourneyActionType } from './interfaces';
import { hasConfirmLink } from './patterns/has-confirm-link';
import { hasUnsubscribeLink } from './patterns/has-unsubscribe-link';
import { handleSubmitOptions } from './submit-options/handle-submit-options';
import { SubmitOptions } from './submit-options/store';
import { buildNodeSegments } from './utils/build-node-segments';
import { nodePath } from './utils/node-path';

const apiGet = {
	[JourneyNodeType.Page]: (creativeId: string, organizationId: string) =>
		api.pages.get(creativeId, organizationId),
	[JourneyNodeType.Email]: (creativeId: string, organizationId: string) =>
		api.emails.get(creativeId, organizationId),
	[JourneyNodeType.Form]: (creativeId: string, organizationId: string) =>
		api.forms.get(creativeId, organizationId),
};

export interface JourneyNode extends Instance<typeof JourneyNode> {}

export const createEmptyNode = (
	path: string,
	type: JourneyNodeType,
): JourneyNode =>
	JourneyNode.create({
		path,
		type,
	});

export const JourneyNode = types
	.model('JourneyNode', {
		path: types.string,
		creativeId: formTypes.guid,
		type: types.maybeNull(
			types.enumeration<JourneyNodeType>(Object.values(JourneyNodeType)),
		),
		/**
		 * List of options related to form. One-click and form nodes have only one submitOptions for themselves.
		 * Pages have list of options for every nested form.
		 */
		submitOptions: types.array(SubmitOptions),
		/**
		 * Currently stores only Email action. Is going to replace SubmitOptions in future refactoring tickets
		 * Will be null if JourneyNode type is NOT Email.
		 */
		actions: types.maybeNull(types.array(types.frozen<JourneyAction>())),
		uid: types.optional(types.identifier, Guid.newGuid),
		creative: types.maybe(types.frozen<Creative>()),
	})
	.views(self => ({
		get segments(): SegmentList {
			const segments = buildNodeSegments(self);
			return segments;
		},
		get isFirstNode(): boolean {
			return self.path === nodePath.first;
		},
		get isRemovable(): boolean {
			return self.path !== nodePath.first;
		},
		get isPage(): boolean {
			return self.type === JourneyNodeType.Page;
		},
		get isUrl(): boolean {
			return self.type === JourneyNodeType.Url;
		},
		get isForm(): boolean {
			return self.type === JourneyNodeType.Form;
		},
		get isOneClick(): boolean {
			return self.type === JourneyNodeType.OneClick;
		},
		get isEmail(): boolean {
			return self.type === JourneyNodeType.Email;
		},
		get isExitPop(): boolean {
			return self.type === JourneyNodeType.ExitPop;
		},
	}))
	.views(self => ({
		get isNegative(): boolean {
			return self.isExitPop;
		},
	}))
	.views(self => ({
		get isPositive(): boolean {
			return !self.isNegative;
		},
	}))
	.actions(self => ({
		updateActions: () => {
			self.actions = self.isEmail
				? cast([
						{ type: JourneyActionType.Next },
						...(hasConfirmLink(self.creative)
							? [{ type: JourneyActionType.Confirm }]
							: []),
						...(hasUnsubscribeLink(self.creative)
							? [{ type: JourneyActionType.Unsubscribe }]
							: []),
				  ])
				: null;
		},
	}))
	.actions(self => ({
		setCreativeId: flow(function*(creativeId: guid): async {
			self.creativeId = creativeId;
			const journey = getParentOfType(self as JourneyNode, Journey);
			const getApi = self.type && apiGet[self.type];
			const isApiExist = creativeId && getApi;
			const creative = isApiExist
				? yield getApi(creativeId, journey.organizationId)
				: undefined;

			if (!hasParent(self)) {
				logger.info('skip action for detached node');
				return;
			}

			handleSubmitOptions(self as JourneyNode, creative);
			self.updateActions();
		}),
		setPath: (path: string) => {
			self.path = path;
		},
	}))
	.actions(self => ({
		setType: flow(function*(type: JourneyNodeType): async {
			if (self.isFirstNode && self.type !== type) {
				yield changeType(self as JourneyNode, type);
			}
		}),
		afterAttach: () => {
			self.setCreativeId(self.creativeId);
		},
	}));
