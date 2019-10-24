import fakerStatic from 'faker';
import * as mobx from 'mobx-state-tree';

import { Journey } from './journey';

import { logger } from '@westech/utils';
import { AddNodeStrategy } from '../../../components/journey-visual/interfaces';
import { JourneyNodeType } from '../../common/enums/journey-node-type';
import * as journeyNode from './journey-node/actions/add-node';
import * as remove from './journey-node/actions/remove-node';
import { arrowIndexProvider } from './journey-node/utils/arrow-index-provider';

describe('Journey', () => {
	const addNodeMock = jest.fn();
	const removeNodeMock = jest.fn();
	const loggerInfoMock = jest.fn();
	const destroyMock = jest.fn();
	const fromFormSegmentOnPageMock = jest.fn();
	const fromFormMock = jest.fn();

	journeyNode.addNode = addNodeMock;
	remove.removeNode = removeNodeMock;
	logger.info = loggerInfoMock;
	mobx.destroy = destroyMock;
	arrowIndexProvider.fromFormSegmentOnPage = fromFormSegmentOnPageMock;
	arrowIndexProvider.fromForm = fromFormMock;

	afterEach(() => {
		addNodeMock.mockClear();
	});

	describe('hasNode', () => {
		it('should return true when node with path is exist', () => {
			const path = fakerStatic.random.word();
			const store = Journey.create({
				journeyNodes: [{ path }],
			});

			expect(store.hasNode(path)).toBeTruthy();
		});

		it('should return false when node is not exist', () => {
			const path = fakerStatic.random.word();
			const store = Journey.create({
				journeyNodes: [],
			});

			expect(store.hasNode(path)).toBeFalsy();
		});
	});

	describe('addPageEmailBlocks', () => {
		it('should add email and page nodes', () => {
			const path = fakerStatic.random.word();
			const pageIndex = fakerStatic.random.number();
			const emailIndex = fakerStatic.random.number();
			const store = Journey.create({
				journeyNodes: [],
			});

			const pageProps = {
				parentNodePath: path,
				arrowIndex: pageIndex,
				nodeType: JourneyNodeType.Page,
				strategy: AddNodeStrategy.AddIfNotExists,
			};

			const emailProps = {
				parentNodePath: path,
				arrowIndex: emailIndex,
				nodeType: JourneyNodeType.Email,
				strategy: AddNodeStrategy.AddIfNotExists,
			};

			store.addPageEmailBlocks(path, pageIndex, emailIndex);

			const addPageNode = addNodeMock.mock.calls[0];
			const addEmailNode = addNodeMock.mock.calls[1];

			expect(addNodeMock).toBeCalledTimes(2);
			expect(addPageNode[0]).toBe(store.journeyNodes);
			expect(addPageNode[1]).toEqual(pageProps);
			expect(addEmailNode[0]).toBe(store.journeyNodes);
			expect(addEmailNode[1]).toEqual(emailProps);
		});
	});

	describe('addNode', () => {
		it('should add node', () => {
			const path = fakerStatic.random.word();
			const pageIndex = fakerStatic.random.number();
			const store = Journey.create({
				journeyNodes: [],
			});

			const pageProps = {
				parentNodePath: path,
				arrowIndex: pageIndex,
				nodeType: JourneyNodeType.Page,
				strategy: AddNodeStrategy.AddIfNotExists,
			};

			store.addNode(pageProps);

			const addPageNode = addNodeMock.mock.calls[0];

			expect(addNodeMock).toBeCalledTimes(1);
			expect(addPageNode[0]).toBe(store.journeyNodes);
			expect(addPageNode[1]).toEqual(pageProps);
		});
	});

	describe('removeNode', () => {
		it('should remove node', () => {
			const path = fakerStatic.random.word();
			const store = Journey.create({
				journeyNodes: [],
			});

			store.removeNode(path);

			const removeNode = removeNodeMock.mock.calls[0];

			expect(removeNodeMock).toBeCalledTimes(1);
			expect(removeNode[0]).toBe(store.journeyNodes);
			expect(removeNode[1]).toBe(path);
		});
	});

	describe('removeBranches', () => {
		it('should remove branch', () => {
			const parentPrefix = fakerStatic.random.word();

			const store = Journey.create({
				journeyNodes: [{ path: parentPrefix }],
			});

			store.removeBranches([parentPrefix]);

			expect(loggerInfoMock).toBeCalledTimes(1);
			expect(destroyMock).toBeCalledTimes(1);
		});
	});

	describe('onFormSegmentsAdded', () => {
		it('should add page email blocks', () => {
			const path = fakerStatic.random.word();
			const addPageEmailBlocksMock = jest.fn();
			fromFormSegmentOnPageMock.mockImplementationOnce(() => ({}));
			const store = Journey.create({
				journeyNodes: [],
			});
			store.addPageEmailBlocks = addPageEmailBlocksMock;

			store.onFormSegmentsAdded(path, [{}]);

			expect(fromFormSegmentOnPageMock).toBeCalledTimes(1);
			expect(addPageEmailBlocksMock).toBeCalledTimes(1);
		});
	});
});
