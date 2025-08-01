import type { INodeProperties } from 'n8n-workflow';
import { SEND_AND_WAIT_OPERATION } from 'n8n-workflow';
import * as send from './send.operation';
import * as sendAndWait from './sendAndWait.operation';

export { send, sendAndWait };

export const descriptions: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['message'],
			},
		},
		options: [
			{
				name: 'Send',
				value: 'send',
				description: 'Send a message',
				action: 'Send a message',
			},
			{
				name: 'Send and Wait for Approval',
				value: SEND_AND_WAIT_OPERATION,
				description: 'Send a message and wait for approval or response',
				action: 'Send a message and wait for approval or response',
			},
		],
		default: 'send',
	},
	...send.description,
	...sendAndWait.description,
];
