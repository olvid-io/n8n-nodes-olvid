/* eslint-disable n8n-nodes-base/node-filename-against-convention */
import { INodeProperties } from 'n8n-workflow';
import { messageReceivedParameters } from './message/onMessageReceived.event';
import { attachmentReceivedParameters } from './attachment/onAttachmentReceived.event';
import { reactionAddedParameters } from './message/onReactionAdded.event';

export const properties: INodeProperties[] = [
	/*
	 ** define updates: available triggers
	 */
	{
		displayName: 'Trigger On',
		name: 'updates',
		type: 'options',
		options: [
			{
				name: 'Message received',
				value: 'messageReceived',
				description:
					'Triggers on new incoming message of any kind — text, photo, sticker, etc',
			},
			{
				name: 'Reaction added',
				value: 'reactionAdded',
				description: 'Triggers on reaction',
			},
			{
				name: 'Attachment received',
				value: 'attachmentReceived',
				description:
					'Triggers on new incoming attachment — photo, video, audio, etc',
			},
		],
		required: true,
		default: 'messageReceived',
	},
	/*
	 ** import each trigger parameters
	 */
	...messageReceivedParameters,
	...attachmentReceivedParameters,
	...reactionAddedParameters,
	/*
	 ** common parameters (set as last parameter)
	 */
	{
		displayName: 'Enable dry-run to see an example of expected output data.',
		name: 'notice',
		type: 'notice',
		default: '',
	},
	{
		displayName: 'Dry-run',
		name: 'dry-run',
		type: 'boolean',
		default: false,
		description:
			"Use mock data when testing this node to check it's output format",
	},
];
