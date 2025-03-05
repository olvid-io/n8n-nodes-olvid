import type { INodeProperties } from 'n8n-workflow';
import * as download from './download.operation';
export { download };

export const descriptons: INodeProperties[]= [
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
	},
	...download.description
];
