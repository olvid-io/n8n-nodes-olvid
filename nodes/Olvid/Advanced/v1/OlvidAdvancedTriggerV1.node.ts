/* eslint-disable n8n-nodes-base/node-class-description-inputs-wrong-regular-node */
import {
	INodeType,
	INodeTypeBaseDescription,
	INodeTypeDescription,
	ITriggerFunctions,
	ITriggerResponse,
	NodeConnectionType,
	NodeOperationError,
} from 'n8n-workflow';

import { testOlvidDaemon } from '../../common-methods/testOlvidDaemon';

import { generatedProperties } from './generated/triggers/generatedProperties';
import { OlvidClient } from '../../client/OlvidClient';
import { triggersMap } from './generated/triggers/routerMap';
import { defaultTriggerWaitTime } from '../../constants';

export class OlvidAdvancedTriggerV1 implements INodeType {
	description: INodeTypeDescription;

	constructor(baseDescription: INodeTypeBaseDescription) {
		this.description = {
			...baseDescription,
			// override base description attributes and add generated properties
			displayName: 'OlvidAdvanced Trigger',
			name: 'olvidTrigger',
			group: ['trigger'],
			version: 1,
			description: 'Start the workflow on Olvid update',
			defaults: {
				name: 'OlvidAdvanced Trigger',
			},
			inputs: [],
			outputs: [NodeConnectionType.Main],
			credentials: [
				{
					name: 'olvidApi',
					required: true,
					testedBy: 'testOlvidDaemon',
				},
			],
			// most of our node properties are generated, those properties contains:
			// triggers list (ex: onMessageReceived, onMessageAdded,...)
			// trigger parameters
			properties: generatedProperties,
		};
	}

	methods = { credentialTest: { testOlvidDaemon } };

	async trigger(this: ITriggerFunctions): Promise<ITriggerResponse> {
		const credentials = (await this.getCredentials('olvidApi')) as {
			clientKey: string;
			daemonEndpoint: string;
		};
		const client = new OlvidClient(credentials.daemonEndpoint, credentials.clientKey);

		const listenerName: string = this.getNodeParameter('updates') as string;

		const initializeListener = (
			callback?: () => void,
			returnMockData: boolean = false,
		): Function => {
			// determine handler to use from lister name parameter
			const handler = triggersMap[listenerName];
			if (!handler) {
				throw new NodeOperationError(
					this.getNode(),
					`Invalid trigger update type: ${listenerName}`,
				);
			}
			return handler.call(this, client, callback, returnMockData);
		};

		// Initialize listeners for active workflows
		let closeListener: Function | undefined;
		if (this.getMode() !== 'manual') {
			closeListener = initializeListener();
		}

		const closeFunction = async () => {
			closeListener?.();
		};

		const useMockData = this.getNodeParameter('mockData') as boolean;

		const manualTriggerFunction = async () => {
			let manualCloseListener: Function = () => {};
			await new Promise((resolve, reject) => {
				const timeoutHandler = setTimeout(() => {
					reject(
						new NodeOperationError(
							this.getNode(),
							`Aborted because no message was received within ${defaultTriggerWaitTime / 1000} seconds.`,
							{
								description: `This ${defaultTriggerWaitTime / 1000}-second timeout only applies to manually triggered executions. Active workflows listen indefinitely.`,
							},
						),
					);
				}, defaultTriggerWaitTime);

				const onCallback = () => {
					clearTimeout(timeoutHandler);
					resolve(true);
				};

				// Initialize listeners with a callback
				manualCloseListener = initializeListener(onCallback, useMockData);
			});
			manualCloseListener();
		};

		return {
			closeFunction,
			manualTriggerFunction,
		};
	}
}
