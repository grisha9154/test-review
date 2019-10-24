import faker from 'faker';

import { ArrowType } from '@westech/journey-visual';
import { formFields } from '@westech/unit';
import { fromPartial, getMockStore } from '@westech/utils';
import * as journeyVisual from '../../components/journey-visual';
import { SegmentArrow } from '../../components/journey-visual/visual-node/interfaces';
import { JourneyNodeType } from '../common/enums/journey-node-type';
import { journeyForm } from './form';
import { Journey } from './form-state/journey';
import { JourneyNode } from './form-state/journey-node/store';
import { QueryParameter } from './form-state/query-parameter/store';

jest.mock('./form-state/journey', () => ({}));

const existFieldsKey = {
	name: 'Name',
	whatYouPromoting: 'What are you promoting?',
	queryParameters: 'Query Parameter',
	journey: 'journey',
};

describe('Journey Form', () => {
	describe('Fields', () => {
		const textBoxMock = jest.fn();
		const multiSelectMock = jest.fn();
		const boxMock = jest.fn();
		const boxArrayMock = jest.fn();
		const boxSelectBoxMock = jest.fn();
		const arrayButtonsMock = jest.fn();
		const journeyVisualMock = jest.fn();

		formFields.textBox = textBoxMock;
		formFields.box = boxMock;
		formFields.multiSelect = multiSelectMock;
		formFields.boxFields.array = boxArrayMock;
		formFields.boxFields.selectBox = boxSelectBoxMock;
		formFields.additional.arrayButtons = arrayButtonsMock;
		journeyVisual.journeyVisual = journeyVisualMock;

		const [journey, clearStore, submit] = getMockStore(
			fromPartial<Journey>({
				setName: jest.fn(),
				setWhatYouPromoting: jest.fn(),
				getMediaOutlets: jest.fn(),
				getQueryParameters: jest.fn(),
				addQueryParameter: jest.fn(),
				removeQueryParameter: jest.fn(),
				addNode: jest.fn(),
				hasNode: jest.fn(),
				removeNode: jest.fn(),
			}),
		);

		afterEach(clearStore);

		const createdFields = journeyForm.fields(journey, submit);

		it('should return 4 fields related to Journey Form', () => {
			const fieldsKey = Object.keys(createdFields);

			expect(fieldsKey).toHaveLength(4);
			fieldsKey.forEach(key => {
				expect(existFieldsKey[key]).toBeTruthy();
			});
		});

		describe('Name', () => {
			const fieldProps = textBoxMock.mock.calls[0][0];

			it('should title to be name', () => {
				expect(fieldProps.title).toBe(existFieldsKey.name);
			});

			describe('setValue', () => {
				it('should update name in the store', () => {
					const name = faker.random.word();

					fieldProps.setValue(name);

					expect(journey.setName).toBeCalledTimes(1);
					expect(journey.setName).toBeCalledWith(name);
				});
			});
		});

		describe('What are you promoting', () => {
			const fieldProps = multiSelectMock.mock.calls[0][0];

			it('should title to be whatYouPromoting', () => {
				expect(fieldProps.title).toBe(existFieldsKey.whatYouPromoting);
			});

			describe('setValue', () => {
				it('should update whatYouPromoting in the store', () => {
					const whatYouPromoting = [
						faker.random.word(),
						faker.random.word(),
					];

					fieldProps.setValue(whatYouPromoting);

					expect(journey.setWhatYouPromoting).toBeCalledTimes(1);
					expect(journey.setWhatYouPromoting).toBeCalledWith(
						whatYouPromoting,
					);
				});
			});

			describe('getMediaOutlets', () => {
				it('should return media outlets', () => {
					const whatYouPromoting: string[] = [];
					journey.getMediaOutlets.mockImplementationOnce(
						() => whatYouPromoting,
					);

					const result = fieldProps.options();

					expect(journey.getMediaOutlets).toBeCalledTimes(1);
					expect(result).toBe(whatYouPromoting);
				});
			});
		});

		describe('Query Parameter', () => {
			const fieldProps = boxMock.mock.calls[0][0];

			it('should title to be queryParameter', () => {
				expect(fieldProps.title).toBe(existFieldsKey.queryParameters);
			});

			describe('itemFields', () => {
				const itemFields = fieldProps.itemFields;

				it('should return 1 field related to queryParameter', () => {
					const fields = Object.keys(itemFields);

					expect(fields).toHaveLength(1);
				});

				describe('queryParameters', () => {
					const queryParametersArrayProps =
						boxArrayMock.mock.calls[0][0];

					const [
						queryParameter,
						clearQueryParameterStore,
					] = getMockStore(
						fromPartial<QueryParameter>({
							setQueryParameterAvailableOnJourneys: jest.fn(),
							setQueryParameterValue: jest.fn(),
						}),
					);
					const index = faker.random.number();

					const queryParametersArrayFields = queryParametersArrayProps.itemFields(
						queryParameter,
						index,
					);

					afterEach(clearQueryParameterStore);

					it('should return 2 fields', () => {
						const fieldsKey = Object.keys(
							queryParametersArrayFields,
						);

						expect(fieldsKey).toHaveLength(2);
					});

					describe('queryParameterName', () => {
						const nameFieldProps =
							boxSelectBoxMock.mock.calls[0][0];

						describe('title', () => {
							it('should return Name', () => {
								const title = nameFieldProps.title;

								expect(title).toBe('Name');
							});
						});

						describe('setValue', () => {
							it('should set query parameter available on journeys', () => {
								nameFieldProps.setValue();

								expect(
									queryParameter.setQueryParameterAvailableOnJourneys,
								).toBeCalledTimes(1);
							});
						});

						describe('options', () => {
							it('should return query parameters', () => {
								const queryParameters: string[] = [];
								journey.getQueryParameters.mockImplementationOnce(
									() => queryParameters,
								);

								const result = nameFieldProps.options();

								expect(
									journey.getQueryParameters,
								).toBeCalledTimes(1);
								expect(result).toBe(queryParameters);
								expect(result).toHaveLength(0);
							});
						});
					});

					describe('queryParameterValue', () => {
						const valueFieldProps =
							boxSelectBoxMock.mock.calls[1][0];

						describe('title', () => {
							it('should return Value', () => {
								const title = valueFieldProps.title;

								expect(title).toBe('Value');
							});
						});

						describe('setValue', () => {
							it('should set query parameter available on journeys', () => {
								valueFieldProps.setValue();

								expect(
									queryParameter.setQueryParameterValue,
								).toBeCalledTimes(1);
								expect(valueFieldProps.setValue).toBe(
									queryParameter.setQueryParameterValue,
								);
							});
						});

						describe('optionDependencies', () => {
							it('should set dependencies as query parameter value', () => {
								queryParameter.values = faker.random.word();

								const result = valueFieldProps.optionDependencies();

								expect(result).toEqual([queryParameter.values]);
							});
						});

						describe('options', () => {
							it('should return empty array when query parameter values are not met', () => {
								const result = valueFieldProps.options();

								expect(result).toEqual([]);
							});

							it('should return query parameter values when one are not met', () => {
								queryParameter.values = [faker.random.word()];

								const result = valueFieldProps.options();

								expect(result).toBe(queryParameter.values);
							});
						});

						describe('additionalComponents', () => {
							it('should should contain 1 component', () => {
								expect(
									valueFieldProps.additionalComponents,
								).toHaveLength(1);
							});

							const arrayButtonProps =
								arrayButtonsMock.mock.calls[0][0];

							describe('array button', () => {
								describe('index', () => {
									it('should pass index related to query parameter', () => {
										expect(arrayButtonProps.index).toBe(
											index,
										);
									});
								});

								describe('add', () => {
									it('should add query parameter', () => {
										arrayButtonProps.add();

										expect(
											journey.addQueryParameter,
										).toBeCalledTimes(1);
									});
								});

								describe('remove', () => {
									it('should add query parameter', () => {
										arrayButtonProps.remove();

										expect(
											journey.removeQueryParameter,
										).toBeCalledTimes(1);
										expect(
											journey.removeQueryParameter,
										).toBeCalledWith(queryParameter);
									});
								});
							});
						});
					});
				});
			});
		});

		describe('Journey', () => {
			const journeyVisualProps = journeyVisualMock.mock.calls[0][0];

			describe('nodes', () => {
				it('should return journey nodes', () => {
					journey.journeyNodes = [];

					expect(journeyVisualProps.nodes()).toBe(
						journey.journeyNodes,
					);
				});
			});

			describe('nodes', () => {
				it('should return false', () => {
					expect(journeyVisualProps.readOnly()).toBeFalsy();
				});
			});

			describe('addNode', () => {
				const addNodeProps = journeyVisualProps.addNode;

				describe('onClick', () => {
					it('should add node', () => {
						addNodeProps.onClick();

						expect(journey.addNode).toBeCalledTimes(1);
					});
				});

				describe('visible', () => {
					it('should return true when next node type is not email', () => {
						const arrowSegment = fromPartial<SegmentArrow>({
							type: ArrowType.Positive,
							nextNodeType: JourneyNodeType.Advertisement,
						});

						expect(addNodeProps.visible(arrowSegment)).toBeTruthy();
					});

					it('should return false when arrow is positive and next node type is email and next node is met', () => {
						const arrowSegment = fromPartial<SegmentArrow>({
							type: ArrowType.Positive,
							nextNodeType: JourneyNodeType.Email,
						});

						journey.hasNode.mockImplementationOnce(() => true);

						expect(addNodeProps.visible(arrowSegment)).toBeFalsy();
					});

					it('should return true when arrow is negative and prev node type is page and next node is not met', () => {
						const arrowSegment = fromPartial<SegmentArrow>({
							type: ArrowType.Negative,
							prevNodeType: JourneyNodeType.Page,
						});

						journey.hasNode.mockImplementationOnce(() => false);

						expect(addNodeProps.visible(arrowSegment)).toBeTruthy();
					});

					it('should return false when arrow is negative and prev node type is not page and next node is met', () => {
						const arrowSegment = fromPartial<SegmentArrow>({
							type: ArrowType.Negative,
							prevNodeType: JourneyNodeType.ExitPop,
						});

						expect(addNodeProps.visible(arrowSegment)).toBeFalsy();
					});
				});
			});

			describe('removeNode', () => {
				it('should remove node', () => {
					journeyVisualProps.removeNode();

					expect(journey.removeNode).toBeCalledTimes(1);
				});
			});

			describe('visible', () => {
				it('should return true', () => {
					expect(journeyVisualProps.visible()).toBeTruthy();
				});
			});

			describe('firstPopoverVisible', () => {
				it('should return true when journey nodes count is 1 and creative Id is not met', () => {
					journey.journeyNodes = [fromPartial<JourneyNode>({})];

					expect(
						journeyVisualProps.firstPopoverVisible(),
					).toBeTruthy();
				});

				it('should return false when journey nodes count is more than 1', () => {
					journey.journeyNodes = [
						fromPartial<JourneyNode>({}),
						fromPartial<JourneyNode>({}),
					];

					expect(
						journeyVisualProps.firstPopoverVisible(),
					).toBeFalsy();
				});

				it('should return false when creative Id is met', () => {
					journey.journeyNodes = [
						fromPartial<JourneyNode>({
							creativeId: faker.random.word(),
						}),
					];

					expect(
						journeyVisualProps.firstPopoverVisible(),
					).toBeFalsy();
				});
			});
		});
	});
});
