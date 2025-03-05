import {ITriggerResponse, NodeOperationError, type ITriggerFunctions, CloseFunction} from 'n8n-workflow';

import * as message from './message';
import * as attachment from './attachment';
import { OlvidClient } from '@olvid/bot-node';
import { defaultTriggerWaitTime } from '../../../constants';

export async function router(this: ITriggerFunctions): Promise<ITriggerResponse> {
    const credentials = await this.getCredentials('olvidApi') as { clientKey: string, daemonEndpoint: string };
    const client = new OlvidClient({
        clientKey: credentials.clientKey,
        serverUrl: credentials.daemonEndpoint,
    });

    const listener = this.getNodeParameter('updates') as string;
    const useMockData = this.getNodeParameter('mockData') as boolean;

    const initializeListener = (callback?: () => void, returnMockData: Boolean = false): Function => {
        switch (listener) {
            case 'messageReceived':
                return message.messageReceived.call(this, client, callback, returnMockData);
            case 'reactionAdded':
                return message.reactionAdded.call(this, client, callback, returnMockData);
            case 'attachmentReceived':
                return attachment.attachmentReceived.call(this, client, callback, returnMockData);
            default:
                throw new NodeOperationError(
                    this.getNode(),
                    `Invalid trigger update type: ${listener}`
                );
        }
    }

	let closeFunction: CloseFunction;
    if (this.getMode() !== 'manual') {
        closeFunction = async () => { initializeListener(); };
    } else {
		closeFunction = async () => {};
	}

    const manualTriggerFunction = async () => {
        let manualCloseListener: Function = () => { };
        await new Promise((resolve, reject) => {
            const timeoutHandler = setTimeout(() => {

                resolve(
                    new NodeOperationError(
                        this.getNode(),
                        `Aborted because no trigger arrived in last ${defaultTriggerWaitTime / 1000} seconds.`,
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

            manualCloseListener = initializeListener(onCallback, useMockData);
        });
        manualCloseListener();
    }

    return {
        closeFunction,
        manualTriggerFunction,
    };
}
