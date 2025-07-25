/* eslint-disable n8n-nodes-base/node-filename-against-convention */
import { NodeConnectionType, type INodeTypeDescription } from 'n8n-workflow';

export const versionDescription: INodeTypeDescription = {
	displayName: 'Olvid Trigger',
	name: 'olvidTrigger',
	group: ['trigger'],
	version: 1,
	description: 'Start the workflow on Olvid update',
	defaults: {
		name: 'Olvid Trigger',
	},
	triggerPanel: {
		header: 'Pull in events from Olvid',
		executionsHelp: {
			inactive:
				"<b>While building your workflow</b>, click the 'listen' button, then send a message, a reaction or an attachment to make an event happen. This will trigger an execution, which will show up in this editor.<br /> <br /><b>Once you're happy with your workflow</b>, <a data-key='activate'>activate</a> it. Then every time an Olvid event is received, the workflow will execute. These executions will show up in the <a data-key='executions'>executions list</a>, but not in the editor.",
			active:
				"<b>While building your workflow</b>, click the 'listen' button, then send a message, a reaction or an attachment to make an event happen. This will trigger an execution, which will show up in this editor.<br /> <br /><b>Your workflow will also execute automatically</b>, since it's activated. Every time an Olvid event is received, this node will trigger an execution. These executions will show up in the <a data-key='executions'>executions list</a>, but not in the editor.",
		},
		activationHint: 'Prepare yourself to send an Olvid Event',
	},

	inputs: [],
	outputs: [NodeConnectionType.Main],
	credentials: [
		{
			name: 'olvidApi',
			required: true,
			testedBy: 'testOlvidDaemon',
		},
	],
	properties: [
		{
			displayName: 'Trigger On',
			name: 'updates',
			type: 'options',
			options: [
				{
					name: 'Message received', // On message received
					value: 'messageReceived',
					description: 'Triggers on new incoming message of any kind — text, photo, sticker, etc',
				},
				{
					name: 'Reaction added', // On reaction added
					value: 'reactionAdded',
					description: 'Triggers on reaction',
				},
				{
					name: 'Attachment received', // On attachment received
					value: 'attachmentReceived',
					description: 'Triggers on new incoming attachment — photo, video, audio, etc',
				},
			],
			required: true,
			default: 'messageReceived',
		},
		{
			displayName: 'Download Attachments',
			name: 'downloadAttachments',
			type: 'boolean',
			default: true,
			description: 'Download attachments from the message',
			displayOptions: {
				show: {
					updates: ['messageReceived', 'attachmentReceived'],
				},
			},
		},
		{
			displayName: 'Dry-run when [🧪 Test step] button pressed',
			name: 'mockData',
			type: 'boolean',
			isNodeSetting: true,
			default: false,
			description:
				'Use mock data for [🧪 Test step] button (located at the top right of the drawer of this modal) to test the workflow without connecting to Olvid daemon',
		},
		// Message Filters
		{
			displayName: 'Message Filters',
			name: 'messageFilters',
			type: 'collection',
			default: {},
			description: 'Advanced filters to specify which messages should trigger the workflow',
			displayOptions: {
				show: {
					updates: ['messageReceived'],
				},
			},
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
					displayName: 'From Specific Contact',
					name: 'senderContactId',
					type: 'number',
					default: 0,
					hint: 'Leave 0 for any contact',
					description: 'Filter messages from a specific contact ID (0 = any contact)',
					displayOptions: {
						show: {
							messageType: ['TYPE_UNSPECIFIED', 'TYPE_INBOUND'],
						},
					},
				},
				{
					displayName: 'From Specific Discussion',
					name: 'discussionId',
					type: 'number',
					default: 0,
					hint: 'Leave 0 for any discussion',
					description: 'Filter messages from a specific discussion ID (0 = any discussion)',
				},
				{
					displayName: 'Has Attachments',
					name: 'hasAttachments',
					type: 'options',
					options: [
						{ name: 'Any', value: 'ATTACHMENT_UNSPECIFIED' },
						{ name: 'Has attachments', value: 'ATTACHMENT_HAVE' },
						{ name: 'No attachments', value: 'ATTACHMENT_HAVE_NOT' },
					],
					default: 'ATTACHMENT_UNSPECIFIED',
					description: 'Filter by presence of attachments',
				},
				{
					displayName: 'Has Location',
					name: 'hasLocation',
					type: 'options',
					options: [
						{ name: 'Any', value: 'LOCATION_UNSPECIFIED' },
						{ name: 'Has location', value: 'LOCATION_HAVE' },
						{ name: 'Is location send', value: 'LOCATION_IS_SEND' },
						{ name: 'Is sharing location', value: 'LOCATION_IS_SHARING' },
						{ name: 'Location sharing finished', value: 'LOCATION_IS_SHARING_FINISHED' },
						{ name: 'No location', value: 'LOCATION_HAVE_NOT' },
					],
					default: 'LOCATION_UNSPECIFIED',
					description: 'Filter by location information',
				},
				{
					displayName: 'Has Reactions',
					name: 'hasReactions',
					type: 'options',
					options: [
						{ name: 'Any', value: 'REACTION_UNSPECIFIED' },
						{ name: 'Has reactions', value: 'REACTION_HAS' },
						{ name: 'No reactions', value: 'REACTION_HAS_NOT' },
					],
					default: 'REACTION_UNSPECIFIED',
					description: 'Filter by presence of reactions',
				},
				{
					displayName: 'Message Type',
					name: 'messageType',
					type: 'options',
					options: [
						{ name: 'Any', value: 'TYPE_UNSPECIFIED' },
						{ name: 'Received (Inbound)', value: 'TYPE_INBOUND' },
						{ name: 'Sent (Outbound)', value: 'TYPE_OUTBOUND' },
					],
					default: 'TYPE_UNSPECIFIED',
					description: 'Filter by message direction',
				},
				{
					displayName: 'Reply Filter',
					name: 'replyFilter',
					type: 'options',
					options: [
						{ name: 'Any message', value: 'none' },
						{ name: 'Only replies', value: 'reply_to_a_message' },
						{ name: 'Only non-replies', value: 'do_not_reply_to_a_message' },
					],
					default: 'none',
					description: 'Filter by whether the message is a reply',
				},
				{
					displayName: 'Time Range',
					name: 'timeRange',
					type: 'collection',
					default: {},
					description: 'Filter messages by time range',
					options: [
						{
							displayName: 'From Date',
							name: 'minTimestamp',
							type: 'dateTime',
							default: '',
							description: 'Only trigger for messages sent after this date/time',
						},
						{
							displayName: 'To Date',
							name: 'maxTimestamp',
							type: 'dateTime',
							default: '',
							description: 'Only trigger for messages sent before this date/time',
						},
					],
				},
			],
		},
		// Attachment Filters
		{
			displayName: 'Attachment Filters',
			name: 'attachmentFilters',
			type: 'collection',
			default: {},
			description: 'Advanced filters for attachment-related triggers',
			displayOptions: {
				show: {
					updates: ['attachmentReceived'],
				},
			},
			options: [
				{
					displayName: 'File Size Range',
					name: 'sizeRange',
					type: 'collection',
					default: {},
					description: 'Filter attachments by file size',
					options: [
						{
							displayName: 'Minimum Size (bytes)',
							name: 'minSize',
							type: 'number',
							default: 0,
							description: 'Minimum file size in bytes (0 = no minimum)',
						},
						{
							displayName: 'Maximum Size (bytes)',
							name: 'maxSize',
							type: 'number',
							default: 0,
							description: 'Maximum file size in bytes (0 = no maximum)',
						},
					],
				},
				{
					displayName: 'File Type',
					name: 'fileType',
					type: 'options',
					options: [
						{ name: 'Any', value: 'FILE_TYPE_UNSPECIFIED' },
						{ name: 'Audio', value: 'FILE_TYPE_AUDIO' },
						{ name: 'Images', value: 'FILE_TYPE_IMAGE' },
						{ name: 'Images & Videos', value: 'FILE_TYPE_IMAGE_VIDEO' },
						{ name: 'Link preview', value: 'FILE_TYPE_LINK_PREVIEW' },
						{ name: 'Not link preview', value: 'FILE_TYPE_NOT_LINK_PREVIEW' },
						{ name: 'Videos', value: 'FILE_TYPE_VIDEO' },
					],
					default: 'FILE_TYPE_UNSPECIFIED',
					description: 'Filter by attachment file type',
				},
				{
					displayName: 'Filename Contains',
					name: 'filenameSearch',
					type: 'string',
					default: '',
					placeholder: '.pdf',
					description: 'Filter attachments whose filename contains this text',
				},
				{
					displayName: 'From Specific Discussion',
					name: 'discussionId',
					type: 'number',
					default: 0,
					hint: 'Leave 0 for any discussion',
					description: 'Filter attachments from a specific discussion ID (0 = any discussion)',
				},
				{
					displayName: 'MIME Type Contains',
					name: 'mimeTypeSearch',
					type: 'string',
					default: '',
					placeholder: 'image/',
					description: 'Filter attachments whose MIME type contains this text',
				},
			],
		},
		// Reaction Filters (for reaction-related triggers)
		{
			displayName: 'Reaction Filters',
			name: 'reactionFilters',
			type: 'collection',
			default: {},
			description: 'Advanced filters for reaction-related triggers',
			displayOptions: {
				show: {
					updates: ['reactionAdded'],
				},
			},
			options: [
				{
					displayName: 'Reaction Emoji',
					name: 'reaction',
					type: 'string',
					default: '',
					placeholder: '👍',
					description: 'Filter by specific reaction emoji (e.g., 👍, ❤️, 😄)',
				},
				{
					displayName: 'Reacted By',
					name: 'reactedBy',
					type: 'options',
					options: [
						{ name: 'Anyone', value: 'any' },
						{ name: 'Me', value: 'me' },
						{ name: 'Specific Contact', value: 'contact' },
					],
					default: 'any',
					description: 'Filter by who added the reaction',
				},
				{
					displayName: 'Contact ID',
					name: 'reactedByContactId',
					type: 'number',
					default: 0,
					hint: 'Contact ID of the person who reacted',
					description: 'Filter reactions by a specific contact ID',
					displayOptions: {
						show: {
							reactedBy: ['contact'],
						},
					},
				},
			],
		},
		// Message Filters for Reaction Events
		{
			displayName: 'Message Filters (for reactions)',
			name: 'messageFilters',
			type: 'collection',
			default: {},
			description: 'Filter which messages can have reactions that trigger this workflow',
			displayOptions: {
				show: {
					updates: ['reactionAdded'],
				},
			},
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
					displayName: 'From Specific Contact',
					name: 'senderContactId',
					type: 'number',
					default: 0,
					hint: 'Leave 0 for any contact',
					description: 'Filter messages from a specific contact ID (0 = any contact)',
				},
				{
					displayName: 'From Specific Discussion',
					name: 'discussionId',
					type: 'number',
					default: 0,
					hint: 'Leave 0 for any discussion',
					description: 'Filter messages from a specific discussion ID (0 = any discussion)',
				},
			],
		},
	],
};
