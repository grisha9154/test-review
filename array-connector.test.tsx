import { render } from '@testing-library/react';
import faker from 'faker';
import React from 'react';

import { fromPartial, mock } from '@westech/utils';
import * as titleComponent from '../title';
import { ArrayConnector } from './array-connector';
import * as arrayItemComponent from './array-item';
import { ArrayConnectorProps } from './interfaces';

interface TestStore {
	id: string;
}

const titleMock = jest.fn<null, [{ children: string }]>(() => null);
const arrayItemMock = jest.fn<null, [{ index: number; store: { id: string } }]>(
	() => null,
);
const valueMock = jest.fn<TestStore[], []>(() => []);

mock(titleComponent, 'Title', titleMock);
mock(arrayItemComponent, 'ArrayItem', arrayItemMock);

afterEach(() => {
	titleMock.mockClear();
	arrayItemMock.mockClear();
	valueMock.mockClear();
});

describe('ArrayConnector', () => {
	const props = fromPartial<ArrayConnectorProps<{ id: string | null }>>({
		value: valueMock,
	});

	describe('Title', () => {
		it('should not render title when it is not met', () => {
			render(<ArrayConnector {...props} />);

			expect(titleMock).toBeCalledTimes(0);
		});

		it('should render title when it is met', () => {
			const title = faker.random.word();

			render(<ArrayConnector {...props} title={title} />);

			expect(titleMock).toBeCalledTimes(1);
			expect(titleMock.mock.calls[0][0].children).toBe(title);
		});
	});

	describe('values', () => {
		it('should render all passed value', () => {
			const values = [{ id: faker.random.word() }];
			valueMock.mockImplementationOnce(() => values);

			render(<ArrayConnector {...props} />);

			expect(arrayItemMock).toBeCalledTimes(values.length);
		});

		it('should render 0 ArrayItem when value is empty', () => {
			render(<ArrayConnector {...props} />);

			expect(arrayItemMock).toBeCalledTimes(0);
		});

		it('should render 0 ArrayItem when value is empty', () => {
			const values = [{ id: faker.random.word() }];
			valueMock.mockImplementationOnce(() => values);

			render(<ArrayConnector {...props} />);

			expect(arrayItemMock).toBeCalledTimes(1);
			const arrayItemProps = arrayItemMock.mock.calls[0][0];
			expect(arrayItemProps.index).toBe(0);
			expect(arrayItemProps.store).toBe(values[0]);
		});
	});
});
