import { INodeProperties, SEND_AND_WAIT_OPERATION } from 'n8n-workflow';
import {downloadParameters} from "./attachment/download.operation";
import {sendAndWaitParameters} from "./message/sendAndWait.operation";
import {sendParameters} from "./message/send.operation";

export const properties: INodeProperties[] = [
	/*
	 ** define resources: actions "categories"
	 */
	{
		displayName: 'Resource',
		name: 'resource',
		type: 'options',
		noDataExpression: true,
		options: [
			{
				name: 'Message',
				value: 'message',
			},
			{
				name: 'Attachment',
				value: 'attachment',
			},
		],
		default: 'message',
	},
	/*
	** define each resource operations, the available "commands" in ode
	 */
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
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['attachment'],
			},
		},
		options: [
			{
				name: 'Download',
				value: 'download',
				description: 'Download message attachments',
				action: 'Download message attachments',
			},
		],
		default: 'download',
	}
];

/*
** add each operation parameters
 */
properties.push(
	...downloadParameters,
	...sendParameters,
	...sendAndWaitParameters
)
