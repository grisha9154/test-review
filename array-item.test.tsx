import { cleanup, render } from '@testing-library/react';
import faker from 'faker';
import React from 'react';

import { fromPartial } from '@westech/utils';
import { SetFieldValidationResult } from '../../form';
import { ArrayItem } from './array-item';
import { ArrayItemConnectorProps } from './interfaces';

import { Styled } from './styled';

interface TestFieldMock {
	fieldName: string;
	registerFieldOnForm: SetFieldValidationResult;
	inPopover: boolean;
}

const containerMock = jest.fn(props => <>{props.children}</>);
const testFieldMock = jest.fn<null, [TestFieldMock]>(() => null);
const itemFieldsMock = jest.fn(() => ({ test: testFieldMock }));

Styled.Container = containerMock;

afterEach(() => {
	containerMock.mockClear();
	testFieldMock.mockClear();
	itemFieldsMock.mockClear();
	cleanup();
});

describe('ArrayItem', () => {
	const props = fromPartial<ArrayItemConnectorProps<{ id: string | null }>>({
		itemFields: itemFieldsMock,
	});

	it('should render fields when it is set', () => {
		const arrayFieldName = faker.random.word();
		const index = faker.random.number();
		const fieldName = 'test';
		const registerFieldOnForm = fromPartial<SetFieldValidationResult>({});
		const inPopover = faker.random.boolean();

		render(
			<ArrayItem
				{...props}
				fieldName={arrayFieldName}
				registerFieldOnForm={registerFieldOnForm}
				inPopover={inPopover}
				index={index}
			/>,
		);
		const fieldMockProps = testFieldMock.mock.calls[0][0];

		expect(containerMock).toBeCalledTimes(1);
		expect(itemFieldsMock).toBeCalledTimes(1);
		expect(testFieldMock).toBeCalledTimes(1);
		expect(fieldMockProps.fieldName).toBe(
			`${arrayFieldName}-${index}-${fieldName}`,
		);
		expect(fieldMockProps.registerFieldOnForm).toEqual(registerFieldOnForm);
		expect(fieldMockProps.inPopover).toEqual(inPopover);
	});
});
