/* eslint-disable n8n-nodes-base/node-class-description-inputs-wrong-regular-node */
// noinspection ExceptionCaughtLocallyJS

import {
	ApplicationError,
	type IDataObject,
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeBaseDescription,
	INodeTypeDescription, NodeConnectionType,
} from 'n8n-workflow';

import { listSearch } from './methods';
import { testOlvidDaemon } from '../../common-methods/testOlvidDaemon';
import { generatedProperties } from './generated/actions/generatedProperties';
import { OlvidAdminClient } from '../../client/OlvidAdminClient';
import { actionMap } from './generated/actions/routerMap';

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
					inputs: [NodeConnectionType.Main],
					outputs: [NodeConnectionType.Main],
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
					properties: generatedProperties
        };
    }

    methods = { listSearch, credentialTest: { testOlvidDaemon } };

    async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
			const items = this.getInputData();
			const operationResult: INodeExecutionData[] = [];
			let responseData: IDataObject | IDataObject[] = [];

			for (let i = 0; i < items.length; i++) {
				const credentials = await this.getCredentials('olvidAdminApi') as { adminClientKey: string, daemonEndpoint: string };
				const client = new OlvidAdminClient(
					credentials.daemonEndpoint,
					credentials.adminClientKey
				);

				const resource = this.getNodeParameter('resource', i);
				let operation = this.getNodeParameter('operation', i);

				try {
					if (!actionMap[resource] || !actionMap[resource][operation]) {
						throw new ApplicationError(`Invalid resource and/or operation: [resource: ${resource}, operation: ${operation}]`);
					}

					const handler = actionMap[resource][operation];
					responseData = await handler.call(this, i, client);
					const executionData = this.helpers.constructExecutionMetaData(
						this.helpers.returnJsonArray(responseData),
						{ itemData: { item: i } },
					);
					operationResult.push(...executionData);
				} catch (err) {
					if (this.continueOnFail()) {
						operationResult.push({ json: this.getInputData(i)[0].json, error: err });
					} else {
						if (err.context) err.context.itemIndex = i;
						throw err;
					}
				}
			}

			return [operationResult];
    }
}
