import type { IExecuteFunctions, IDataObject, INodeExecutionData } from 'n8n-workflow';

import { callOperation } from '../generated/actions/generatedCallOperation';
import type { Olvid } from '../generated/actions/generatedInterfaces';
import { OlvidAdminClient } from '@olvid/bot-node';

export async function router(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    const items = this.getInputData();
    const operationResult: INodeExecutionData[] = [];
    let responseData: IDataObject | IDataObject[] = [];

    for (let i = 0; i < items.length; i++) {
        const credentials = await this.getCredentials('olvidAdminApi') as { adminClientKey: string, daemonEndpoint: string };
        const client = new OlvidAdminClient({
            serverUrl: credentials.daemonEndpoint,
            clientKey: credentials.adminClientKey,
        });

        const resource = this.getNodeParameter('resource', i);
        let operation = this.getNodeParameter('operation', i);

        const olvid = {
            resource,
            operation,
        } as Olvid;

        try {
            responseData = await callOperation.call(this, i, client, olvid);
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
