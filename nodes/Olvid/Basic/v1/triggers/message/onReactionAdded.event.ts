import {
	type IDisplayOptions,
	type INodeProperties,
	updateDisplayOptions,
} from 'n8n-workflow';
import { contactIdPicker } from '../../../../common-properties/contactIdPicker';
import { discussionIdPicker } from '../../../../common-properties/discussionIdPicker';

const parameters: INodeProperties[] = [
	// Reaction Filters (for reaction-related triggers)
	{
		displayName: 'Reaction filters',
		name: 'reactionFilters',
		type: 'collection',
		default: {},
		description: 'Advanced filters for reaction-related triggers',
		options: [
			{
				displayName: 'Reaction Emoji',
				name: 'reaction',
				type: 'string',
				default: '👍',
				description: 'Filter by specific reaction emoji (e.g., 👍, ❤️, 😄)',
			},
			{
				...contactIdPicker,
				displayName: 'From a Specific Contact',
				description: 'Filter reactions from a specific contact ID',
			},
		],
	},
	// Message Filters for Reaction Events
	{
		displayName: 'Reacted message filters',
		name: 'messageFilters',
		type: 'collection',
		default: {},
		description:
			'Filter which messages can have reactions that trigger this workflow',
		options: [
			{
				displayName: 'Body Search (Regex)',
				name: 'bodySearch',
				type: 'string',
				default: '',
				placeholder: 'hello|@.*',
				hint: 'Filter messages containing this text/regex pattern',
				description:
					'Use regular expressions to filter messages by content (e.g., "hello" or "^@.*" for messages starting with @)',
			},
			{
				...contactIdPicker,
				displayName: 'By a specific Contact',
				description:
					'Filter messages from a specific contact ID (0 = any contact)',
			},
			{
				...discussionIdPicker,
				displayName: 'In a specific Discussion',
				description:
					'Filter messages in a specific discussion ID (0 = any discussion)',
			},
		],
	},
];

const displayOptions: IDisplayOptions = {
	show: {
		updates: ['reactionAdded'],
	},
};

export const reactionAddedParameters = updateDisplayOptions(
	displayOptions,
	parameters,
);
