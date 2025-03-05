import type { IExecuteFunctions, IDataObject, INodeExecutionData } from 'n8n-workflow';

import * as message_operations from './message';
import * as attachment_operations from './attachment';
import { OlvidClient } from '@olvid/bot-node';
import type { AllEntities } from 'n8n-workflow';

type OlvidMap = AllEntities<{
    message: 'send';
    attachment: 'download';
}>;

export async function router(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    const items = this.getInputData();
    const operationResult: INodeExecutionData[] = [];
    let responseData: IDataObject | IDataObject[] = [];

    for (let i = 0; i < items.length; i++) {
        const credentials = await this.getCredentials('olvidApi') as { clientKey: string, daemonEndpoint: string };
        const client = new OlvidClient({
            serverUrl: credentials.daemonEndpoint,
            clientKey: credentials.clientKey,
        });

        const resource = this.getNodeParameter<OlvidMap>('resource', i);
        let operation = this.getNodeParameter('operation', i);

        const olvidMap = {
            resource,
            operation,
        } as OlvidMap;

        try {
            switch (olvidMap.resource) {
                case 'message':
                    responseData = await message_operations[olvidMap.operation].execute.call(this, i, client);
                    break;
                case 'attachment':
                    responseData = await attachment_operations[olvidMap.operation].execute.call(this, i, client);
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
