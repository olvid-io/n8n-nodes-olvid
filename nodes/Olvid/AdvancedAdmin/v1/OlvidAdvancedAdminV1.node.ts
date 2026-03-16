/* eslint-disable n8n-nodes-base/node-class-description-inputs-wrong-regular-node */
// noinspection ExceptionCaughtLocallyJS

import {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeBaseDescription,
	INodeTypeDescription,
	NodeConnectionTypes,
	NodeOperationError,
} from 'n8n-workflow';

import { testOlvidCredentials } from '../../common-properties/testOlvidCredentials';
import { generatedProperties } from './generated/actions/generatedProperties';
import * as admins from '../../protobuf/olvid/daemon/admin/v1/admin';
import { convertN8nParametersToAValidRequestBuilder } from '../../Advanced/v1/convertN8nToProtobuf';
import {
	buildListResponseMessage,
	buildResponseMessage,
} from '../../Advanced/v1/convertProtobufToN8n';
import { OlvidClientSingleton } from '../../utils/OlvidClientSingleton';

export class OlvidAdvancedAdminV1 implements INodeType {
	description: INodeTypeDescription;

	constructor(baseDescription: INodeTypeBaseDescription) {
		this.description = {
			...baseDescription,
			// override base description attributes and add generated properties
			displayName: 'OlvidAdvancedAdmin',
			name: 'olvidAdvancedAdmin',
			group: ['output'],
			version: 1,
			description: 'Sends data to OlvidAdvancedAdmin',
			defaults: {
				name: 'OlvidAdvancedAdmin',
			},
			inputs: [NodeConnectionTypes.Main],
			outputs: [NodeConnectionTypes.Main],
			credentials: [
				{
					name: 'olvidAdminApi',
					required: true,
					testedBy: 'testOlvidDaemon',
				},
			],
			// most of our node properties are generated, those properties contains:
			// actions list (ex: messageSend, invitationNew,...)
			// actions parameters
			properties: generatedProperties,
		};
	}

	methods = { credentialTest: { testOlvidDaemon: testOlvidCredentials } };

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const operationResult: INodeExecutionData[] = [];

		// create client
		const credentials = (await this.getCredentials('olvidAdminApi')) as {
			adminClientKey: string;
			daemonEndpoint: string;
		};
		const client = OlvidClientSingleton.getAdminInstance(credentials);

		// a node can receive one or more items as input, so we loop on this loop
		for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
			// retrieve command information
			const resourceName = this.getNodeParameter('resource', itemIndex);
			const operationName = this.getNodeParameter('operation', itemIndex);

			const stubName: string = getStubName(resourceName);
			const stubMethodName: string = getStubMethodName(operationName);
			// @ts-ignore
			const stubFunction = client.adminStubs[stubName][stubMethodName];
			if (stubFunction === undefined) {
				throw new NodeOperationError(
					this.getNode(),
					`Invalid action resource / operation combination for stub function: ${resourceName} & ${operationName}`,
				);
			}

			// determine the response protobuf schema
			const schemaName: string = getResponseSchema(operationName);
			// @ts-ignore
			const responseSchema = admins[schemaName];
			if (responseSchema === undefined) {
				throw new NodeOperationError(
					this.getNode(),
					`Invalid action resource / operation combination for response schema: ${resourceName} & ${operationName}`,
				);
			}

			// prepare request: we convert n8n parameters to an object to use as protobuf request message
			const requestShape = this.getNode().parameters;
			convertN8nParametersToAValidRequestBuilder(
				requestShape,
				(parameterName) => {
					return this.getNodeParameter(parameterName, itemIndex);
				},
			);

			try {
				let responseData: INodeExecutionData[] = [];
				const ret = await stubFunction(requestShape);

				// if ret is iterable it's a server streaming method, we concatenate response messages
				if (typeof ret[Symbol.asyncIterator] === 'function') {
					for await (const message of ret) {
						responseData.push(
							...buildListResponseMessage(
								message,
								responseSchema,
								this.helpers.returnJsonArray,
							),
						);
					}
				} else {
					responseData = buildResponseMessage(
						ret,
						responseSchema,
						this.helpers.returnJsonArray,
					);
				}
				const executionDataWithMetadata =
					this.helpers.constructExecutionMetaData(responseData, {
						itemData: { item: itemIndex },
					});
				operationResult.push(...executionDataWithMetadata);
			} catch (err) {
				if (this.continueOnFail()) {
					operationResult.push({
						json: this.getInputData(itemIndex)[0].json,
						error: err,
					});
				} else {
					if (err.context) err.context.itemIndex = itemIndex;
					throw err;
				}
			}
		}

		return [operationResult];
	}
}

function getStubName(resourceName: string): string {
	const decapitalizedName =
		resourceName.charAt(0).toLowerCase() + resourceName.slice(1);
	return decapitalizedName.replace('Service', 'Stub');
}

function getStubMethodName(operationName: string): string {
	return operationName.charAt(0).toLowerCase() + operationName.slice(1);
}

function getResponseSchema(operationName: string): string {
	return `${operationName}ResponseSchema`;
}
