import { ArrowType } from '@westech/journey-visual';
import { FormConfig, formEvents, formFields } from '@westech/unit';
import { api } from '../../api';
import { journeyVisual } from '../../components/journey-visual';
import { fieldPlaceholders } from '../common/constants/resource';
import { JourneyNodeType } from '../common/enums/journey-node-type';
import { journeyNodesConfig } from './form-fields/journey-nodes-config';
import { Journey } from './form-state/journey';
import { QueryParameter } from './form-state/query-parameter/store';

export const journeyForm: FormConfig<Journey> = {
	events: formEvents(Journey, api.urls.journey.crud),
	fields: journey => ({
		name: formFields.textBox({
			title: 'Name',
			value: () => journey.name,
			setValue: journey.setName,
		}),
		whatYouPromoting: formFields.multiSelect({
			title: 'What are you promoting?',
			value: () => journey.whatAreYouPromotingIds,
			setValue: journey.setWhatYouPromoting,
			options: journey.getMediaOutlets,
			placeholder: fieldPlaceholders.whatYouPromoting,
		}),
		queryParameters: formFields.box({
			title: 'Query Parameter',
			setValue: () => undefined,
			value: () => undefined,
			itemFields: {
				queryParameters: formFields.boxFields.array<QueryParameter>({
					value: () => journey.queryParameters,
					itemFields: (queryParameter, index) => ({
						queryParameterName: formFields.boxFields.selectBox({
							value: () => queryParameter.queryParameterId,
							title: 'Name',
							setValue:
								queryParameter.setQueryParameterAvailableOnJourneys,
							options: journey.getQueryParameters,
						}),
						queryParameterValue: formFields.boxFields.selectBox({
							value: () => queryParameter.queryParameterValueId,
							title: 'Value',
							setValue: queryParameter.setQueryParameterValue,
							optionDependencies: () => [queryParameter.values],
							options: () =>
								queryParameter.values
									? queryParameter.values
									: [],
							additionalComponents: [
								formFields.additional.arrayButtons({
									index,
									add: journey.addQueryParameter,
									remove: () =>
										journey.removeQueryParameter(
											queryParameter,
										),
								}),
							],
						}),
					}),
				}),
			},
		}),
		journey: journeyVisual({
			nodes: () => journey.journeyNodes,
			readOnly: () => false,
			addNode: {
				onClick: journey.addNode,
				visible: arrowSegment => {
					return arrowSegment.type === ArrowType.Positive
						? arrowSegment.nextNodeType !== JourneyNodeType.Email ||
								!journey.hasNode(arrowSegment.nextPath)
						: arrowSegment.prevNodeType === JourneyNodeType.Page &&
								!journey.hasNode(arrowSegment.nextPath);
				},
			},
			removeNode: journey.removeNode,
			nodeConfig: journeyNodesConfig(() => journey),
			visible: () => true,
			firstPopoverVisible: () => {
				return (
					journey.journeyNodes.length === 1 &&
					!journey.journeyNodes[0].creativeId
				);
			},
		}),
	}),
};
