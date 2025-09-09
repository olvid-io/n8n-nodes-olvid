/* eslint-disable n8n-nodes-base/node-class-description-inputs-wrong-regular-node */
// noinspection ExceptionCaughtLocallyJS

import {
	ApplicationError,
	type IDataObject,
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeBaseDescription,
	INodeTypeDescription,
	NodeConnectionType,
} from 'n8n-workflow';

import { listSearch } from './methods';

import { testOlvidDaemon } from '../../common-methods/testOlvidDaemon';
import fs from 'node:fs';
import util from 'node:util';
import { generatedProperties } from './generated/actions/generatedProperties';
import { OlvidClient } from '../../client/OlvidClient';
import { actionMap } from './generated/actions/routerMap';

export class OlvidAdvancedV1 implements INodeType {
    description: INodeTypeDescription;

    constructor(baseDescription: INodeTypeBaseDescription) {
        this.description = {
					...baseDescription,
					// override base description attributes and add generated properties
					displayName: 'OlvidAdvanced',
					// TODO rename (and in trigger)
					name: 'olvidAdvanced',
					group: ['output'],
					version: 1,
					// TODO change (and in trigger)
					description: 'Sends data to OlvidAdvanced',
					defaults: {
						name: 'OlvidAdvanced',
					},
					inputs: [NodeConnectionType.Main],
					outputs: [NodeConnectionType.Main],
					credentials: [
						{
							name: 'olvidApi',
							required: true,
							testedBy: 'testOlvidDaemon',
						},
					],
					// most of our node properties are generated, those properties contains:
					// actions list (ex: messageSend, invitationNew,...)
					// actions parameters
					properties: generatedProperties,
        };
			// TODO TODEL
			fs.writeFileSync("/home/visago/Desktop/olvid/daemon/n8n/json/olvid-advanced-action.json", util.inspect(this.description, {depth: null}));
		}

    methods = { listSearch, credentialTest: { testOlvidDaemon } };

    async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
			const items = this.getInputData();
			const operationResult: INodeExecutionData[] = [];
			let responseData: IDataObject | IDataObject[] = [];

			for (let i = 0; i < items.length; i++) {
				const credentials = await this.getCredentials('olvidApi') as { clientKey: string, daemonEndpoint: string };
				const client = new OlvidClient(
					credentials.daemonEndpoint,
					credentials.clientKey,
				);

				const resource = this.getNodeParameter('resource', i);
				let operation = this.getNodeParameter('operation', i);

				try {
					if (!actionMap[resource] || !actionMap[resource][operation]) {
						throw new ApplicationError(`Invalid resource and/or operation: [resource: ${resource}, operation: ${operation}]`);
					}
					const handler = actionMap[resource][operation];
					responseData = await handler.call(this, i, client)
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
