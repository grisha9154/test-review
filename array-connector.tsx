import { observer } from 'mobx-react';
import React from 'react';

import { Title } from '../title';
import { ArrayItem } from './array-item';
import { ArrayConnectorProps } from './interfaces';

export const ArrayConnector = observer(
	<TItemStore extends { id: string | null }>(
		props: ArrayConnectorProps<TItemStore>,
	) => {
		const value = props.value();
		const title = props.title;

		return (
			<>
				{title && <Title>{title}</Title>}
				{value.map((itemStore, index) => (
					<ArrayItem
						key={itemStore.id || index}
						index={index}
						{...props}
						store={itemStore}
					/>
				))}
			</>
		);
	},
);
