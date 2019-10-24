import { observer } from 'mobx-react';
import React from 'react';

import { ArrayItemConnectorProps } from './interfaces';

import { Styled } from './styled';

export const ArrayItem = observer(
	<TItemStore extends {}>(props: ArrayItemConnectorProps<TItemStore>) => {
		const { index } = props;
		const arrayItemName = `${props.fieldName}-${index}`;

		const fields = props.itemFields(props.store, index);
		return (
			<Styled.Container>
				{Object.keys(fields).map(fieldName => {
					const Field = fields[fieldName];
					return (
						<Field
							fieldName={`${arrayItemName}-${fieldName}`}
							registerFieldOnForm={props.registerFieldOnForm}
							inPopover={props.inPopover}
							key={fieldName}
						/>
					);
				})}
			</Styled.Container>
		);
	},
);
