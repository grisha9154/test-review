import { flow, Instance, types } from 'mobx-state-tree';

import { async, formTypes, guid, Option } from '@westech/unit';
import { apiClient } from '@westech/utils';
import { urls } from '../../../../api/urls';
import { mapToQueryParameterOptions } from '../../../common/query-parameter/map-to-query-parameter-option';

export interface QueryParameter extends Instance<typeof QueryParameter> {}

export const QueryParameter = types
	.model('QueryParameter', {
		id: formTypes.guid,
		queryParameterId: formTypes.guid,
		queryParameterValueId: formTypes.guid,
		values: types.maybe(types.frozen<Option[]>([])),
	})
	.actions(self => ({
		setQueryParameterAvailableOnJourneys: flow(function*(
			queryParameterId: guid,
		): async {
			self.queryParameterId = queryParameterId;
			const result = queryParameterId
				? yield apiClient.get(
						urls.queryParameter.crud.get(queryParameterId),
				  )
				: [];
			const queryParameter = result.data;
			self.values =
				queryParameter &&
				queryParameter.values &&
				queryParameter.availableOnJourneys
					? mapToQueryParameterOptions(queryParameter.values)
					: [];
		}),
		setQueryParameterValue: (selectedValueId: guid) =>
			(self.queryParameterValueId = selectedValueId),
	}))
	.actions(self => ({
		afterAttach: () => {
			self.setQueryParameterAvailableOnJourneys(self.queryParameterId);
		},
	}));
