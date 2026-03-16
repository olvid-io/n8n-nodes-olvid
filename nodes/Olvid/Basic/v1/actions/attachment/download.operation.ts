import { updateDisplayOptions, INodeProperties } from 'n8n-workflow';

const properties: INodeProperties[] = [
	{
		displayName: 'MessageId',
		name: 'messageId',
		type: 'collection',
		default: {
			type: 'TYPE_UNSPECIFIED',
			id: 0,
		},
		options: [
			{
				displayName: 'MessageId | Type',
				name: 'type',
				type: 'options',

				options: [
					{ name: 'TYPE_UNSPECIFIED', value: 0 },
					{ name: 'TYPE_INBOUND', value: 1 },
					{ name: 'TYPE_OUTBOUND', value: 2 },
				],
				default: 0,
			},
			{
				displayName: 'MessageId|ID',
				name: 'id',
				type: 'number',
				default: 0,
			},
		],
	},
];

const displayOptions = {
	show: {
		resource: ['attachment'],
		operation: ['download'],
	},
};

export const downloadParameters: INodeProperties[] = updateDisplayOptions(
	displayOptions,
	properties,
);
