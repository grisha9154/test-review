import fakerStatic from 'faker';

import { Option } from '@westech/unit';
import { apiClient } from '@westech/utils';
import { urls } from '../../../../api/urls';
import * as mapper from '../../../common/query-parameter/map-to-query-parameter-option';

import { QueryParameter } from './store';

describe('QueryParameter', () => {
	const urlsGetMock = jest.fn();
	const apiGet = jest.fn();
	const mapToQueryParameterOptionsMock = jest.fn();

	urls.queryParameter.crud.get = urlsGetMock;
	apiClient.get = apiGet;
	mapper.mapToQueryParameterOptions = mapToQueryParameterOptionsMock;

	describe('setQueryParameterAvailableOnJourneys', () => {
		it('should set empty array when queryParameterId is null', () => {
			const store = QueryParameter.create();

			store.setQueryParameterAvailableOnJourneys(null);

			expect(store.values).toEqual([]);
		});

		it('should set empty array when queryParameterId is null', () => {
			const store = QueryParameter.create();
			apiGet.mockImplementationOnce(() => ({
				data: { values: [], availableOnJourneys: true },
			}));
			const queryParameterValue: Option[] = [];
			mapToQueryParameterOptionsMock.mockImplementationOnce(
				() => queryParameterValue,
			);

			store.setQueryParameterAvailableOnJourneys(
				fakerStatic.random.word(),
			);

			expect(store.values).toEqual(queryParameterValue);
		});
	});

	describe('setQueryParameterValue', () => {
		it('should set queryParameterValueId', () => {
			const store = QueryParameter.create();
			const selectedValueId = fakerStatic.random.word();

			store.setQueryParameterValue(selectedValueId);

			expect(store.queryParameterValueId).toBe(selectedValueId);
		});
	});

	describe('afterAttach', () => {
		it('should set Query Parameter Available On Journeys', () => {
			const store = QueryParameter.create();
			const setQueryParameterAvailableOnJourneysMock = jest.fn();
			store.setQueryParameterAvailableOnJourneys = setQueryParameterAvailableOnJourneysMock;

			store.afterAttach();

			expect(setQueryParameterAvailableOnJourneysMock).toBeCalledTimes(1);
		});
	});
});
