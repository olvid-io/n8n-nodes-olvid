import { ITriggerResponse, NodeOperationError, type ITriggerFunctions } from 'n8n-workflow';

import { OlvidClient } from '../../../client/OlvidClient';
import { triggersMap } from '../generated/triggers/triggerMap';
import { defaultTriggerWaitTime } from '../../../constants';

export async function router(this: ITriggerFunctions): Promise<ITriggerResponse> {
    const credentials = await this.getCredentials('olvidApi') as { clientKey: string, daemonEndpoint: string };
    const client = new OlvidClient(
        credentials.daemonEndpoint,
        credentials.clientKey
    );

    const listenerName: string = this.getNodeParameter('updates') as string;
		console.warn("listener")

    const initializeListener = (callback?: () => void, returnMockData: boolean = false): Function => {
        const handler = triggersMap[listenerName];
        if (!handler) {
            throw new NodeOperationError(
                this.getNode(),
                `Invalid trigger update type: ${listenerName}`
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
        let manualCloseListener: Function = () => { };
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
