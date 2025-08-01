import type { IExecuteFunctions, IDataObject, INodeExecutionData } from 'n8n-workflow';
import { SEND_AND_WAIT_OPERATION } from 'n8n-workflow';

import * as message_operations from './message';
import * as attachment_operations from './attachment';
import { OlvidClient } from '../../../client/OlvidClient';
import { executeSendAndWait } from './utils/sendAndWait';
import type { AllEntities } from 'n8n-workflow';

type OlvidMap = AllEntities<{
	message: 'send' | typeof SEND_AND_WAIT_OPERATION;
	attachment: 'download';
}>;

export async function router(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
	const items = this.getInputData();
	const operationResult: INodeExecutionData[] = [];
	let responseData: IDataObject | IDataObject[] = [];

	for (let i = 0; i < items.length; i++) {
		const credentials = (await this.getCredentials('olvidApi')) as {
			clientKey: string;
			daemonEndpoint: string;
		};
		const client = new OlvidClient(credentials.daemonEndpoint, credentials.clientKey);

		const resource = this.getNodeParameter<OlvidMap>('resource', i);
		let operation = this.getNodeParameter('operation', i);

		const olvidMap = {
			resource,
			operation,
		} as OlvidMap;

		try {
			switch (olvidMap.resource) {
				case 'message':
					if (olvidMap.operation === SEND_AND_WAIT_OPERATION) {
						// Handle send-and-wait operation
						responseData = await executeSendAndWait.call(this, i, client);
					} else {
						responseData = await message_operations[olvidMap.operation].execute.call(
							this,
							i,
							client,
						);
					}
					break;
				case 'attachment':
					responseData = await attachment_operations[olvidMap.operation].execute.call(
						this,
						i,
						client,
					);
					break;
			}

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
