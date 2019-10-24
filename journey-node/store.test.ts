import staticFaker from 'faker';
import * as MST from 'mobx-state-tree';

import { api } from '../../../../api';
import { JourneyNodeType } from '../../../common/enums/journey-node-type';
import * as changer from './actions/change-type';
import * as actions from './actions/shift-branch';
import * as handler from './submit-options/handle-submit-options';

import { JourneyNode } from './store';

describe('Submit Options Store', () => {
	const processShiftMock = jest.fn();
	const getParentOfTypeMock = jest.fn();
	const apiMediaOutletsGetMock = jest.fn();
	const apiFormGetMock = jest.fn();
	const handleSubmitOptionsMock = jest.fn();
	const hasParentMock = jest.fn();
	const changeTypeMock = jest.fn();

	actions.processShift = processShiftMock;
	MST.getParentOfType = getParentOfTypeMock;
	MST.hasParent = hasParentMock;
	api.mediaOutlets.get = apiMediaOutletsGetMock;
	api.forms.get = apiFormGetMock;
	handler.handleSubmitOptions = handleSubmitOptionsMock;
	changer.changeType = changeTypeMock;

	afterEach(() => {
		handleSubmitOptionsMock.mockClear();
		apiFormGetMock.mockClear();
		changeTypeMock.mockClear();
	});

	const model = { path: staticFaker.random.word() };

	describe('isFirstNode', () => {
		it('should return true when path is "1"', () => {
			const store = JourneyNode.create({ path: '1' });

			expect(store.isFirstNode).toBeTruthy();
		});
	});

	describe('isRemovable', () => {
		it('should return false when path is "1"', () => {
			const store = JourneyNode.create({ path: '1' });

			expect(store.isRemovable).toBeFalsy();
		});

		it('should return true when path is not "1"', () => {
			const store = JourneyNode.create(model);

			expect(store.isRemovable).toBeTruthy();
		});
	});

	describe('isPage', () => {
		it('should return true when type is "Page"', () => {
			const store = JourneyNode.create({
				...model,
				type: JourneyNodeType.Page,
			});

			expect(store.isPage).toBeTruthy();
		});

		it('should return false when path is not "Page"', () => {
			const store = JourneyNode.create(model);

			expect(store.isPage).toBeFalsy();
		});
	});

	describe('isUrl', () => {
		it('should return true when type is "Url"', () => {
			const store = JourneyNode.create({
				...model,
				type: JourneyNodeType.Url,
			});

			expect(store.isUrl).toBeTruthy();
		});

		it('should return false when path is not "Url"', () => {
			const store = JourneyNode.create(model);

			expect(store.isUrl).toBeFalsy();
		});
	});

	describe('isForm', () => {
		it('should return true when type is "Form"', () => {
			const store = JourneyNode.create({
				...model,
				type: JourneyNodeType.Form,
			});

			expect(store.isForm).toBeTruthy();
		});

		it('should return false when path is not "Form"', () => {
			const store = JourneyNode.create(model);

			expect(store.isForm).toBeFalsy();
		});
	});

	describe('isOneClick', () => {
		it('should return true when type is "OneClick"', () => {
			const store = JourneyNode.create({
				...model,
				type: JourneyNodeType.OneClick,
			});

			expect(store.isOneClick).toBeTruthy();
		});

		it('should return false when path is not "OneClick"', () => {
			const store = JourneyNode.create(model);

			expect(store.isOneClick).toBeFalsy();
		});
	});

	describe('isEmail', () => {
		it('should return true when type is "Email"', () => {
			const store = JourneyNode.create({
				...model,
				type: JourneyNodeType.Email,
			});

			expect(store.isEmail).toBeTruthy();
		});

		it('should return false when path is not "Email"', () => {
			const store = JourneyNode.create(model);

			expect(store.isEmail).toBeFalsy();
		});
	});

	describe('isExitPop', () => {
		it('should return true when type is "ExitPop"', () => {
			const store = JourneyNode.create({
				...model,
				type: JourneyNodeType.ExitPop,
			});

			expect(store.isExitPop).toBeTruthy();
		});

		it('should return false when path is not "ExitPop"', () => {
			const store = JourneyNode.create(model);

			expect(store.isExitPop).toBeFalsy();
		});
	});

	describe('isNegative', () => {
		it('should return true when type is "ExitPop"', () => {
			const store = JourneyNode.create({
				...model,
				type: JourneyNodeType.ExitPop,
			});

			expect(store.isExitPop).toBeTruthy();
		});

		it('should return false when path is not "ExitPop"', () => {
			const store = JourneyNode.create(model);

			expect(store.isExitPop).toBeFalsy();
		});
	});

	describe('isPositive', () => {
		it('should return true when type is not "ExitPop"', () => {
			const store = JourneyNode.create(model);

			expect(store.isPositive).toBeTruthy();
		});

		it('should return false when path is "ExitPop"', () => {
			const store = JourneyNode.create({
				...model,
				type: JourneyNodeType.ExitPop,
			});

			expect(store.isPositive).toBeFalsy();
		});
	});

	describe('setCreativeId', () => {
		it('should return undefined when creativeId is null', () => {
			getParentOfTypeMock.mockImplementationOnce(() => ({
				organizationId: staticFaker.random.word(),
			}));
			hasParentMock.mockImplementationOnce(() => true);
			const store = JourneyNode.create(model);

			store.setCreativeId(null);

			expect(handleSubmitOptionsMock).toBeCalledTimes(1);
			expect(handleSubmitOptionsMock).toBeCalledWith(store, undefined);
		});

		it('should set creative when creativeId is met and api exist', async () => {
			const creative = {};
			getParentOfTypeMock.mockImplementationOnce(() => ({
				organizationId: staticFaker.random.word(),
			}));
			hasParentMock.mockImplementationOnce(() => true);
			apiFormGetMock.mockImplementationOnce(() =>
				Promise.resolve(creative),
			);

			const store = JourneyNode.create({
				...model,
				type: JourneyNodeType.Form,
			});

			await store.setCreativeId(staticFaker.random.word());

			expect(apiFormGetMock).toBeCalledTimes(1);
			expect(handleSubmitOptionsMock).toBeCalledTimes(1);
			expect(handleSubmitOptionsMock).toBeCalledWith(store, creative);
		});
	});

	describe('setType', () => {
		it('should change type when first node and new type', () => {
			const store = JourneyNode.create({ path: '1' });

			store.setType(JourneyNodeType.Form);

			expect(changeTypeMock).toBeCalledTimes(1);
			expect(changeTypeMock).toBeCalledWith(store, JourneyNodeType.Form);
		});
	});

	describe('afterAttach', () => {
		it('should set creative id', () => {
			const store = JourneyNode.create(model);
			const setCreativeIdMock = jest.fn();
			store.setCreativeId = setCreativeIdMock;

			store.afterAttach();

			expect(setCreativeIdMock).toBeCalledTimes(1);
		});
	});
});
