import { NodeConnectionType, type INodeTypeDescription } from 'n8n-workflow';
import { generatedDescriptions } from '../generated/triggers/generatedVersionDescription';

export const versionDescription: INodeTypeDescription = {
	displayName: 'OlvidAdvanced Trigger',
	name: 'olvidTrigger',
	group: ['trigger'],
	version: 1,
	description: 'Start the workflow on Olvid update',
	defaults: {
		name: 'OlvidAdvanced Trigger',
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
			options: [...generatedDescriptions],
			required: true,
			default: '',
		},
		{
			displayName: 'Dry Run for "Test Step" (Use Mock Data) WARNING: WIP',
			name: 'mockData',
			type: 'boolean',
			// isNodeSetting: true,
			default: false,
			description:
				'Use mock data for "Test step" to test the workflow without connecting to Olvid daemon',
		},
		// Message Filters (for all message-related triggers)
		{
			displayName: 'Message Filters',
			name: 'messageFilters',
			type: 'collection',
			default: {},
			description: 'Advanced filters to specify which messages should trigger the workflow',
			displayOptions: {
				show: {
					updates: [
						'messageReceived',
						'messageSent',
						'messageDeleted',
						'messageBodyUpdated',
						'messageUploaded',
						'messageDelivered',
						'messageRead',
						'messageLocationReceived',
						'messageLocationSent',
						'messageLocationSharingStart',
						'messageLocationSharingUpdate',
						'messageLocationSharingEnd',
						'messageReactionAdded',
						'messageReactionUpdated',
						'messageReactionRemoved',
					],
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
		// Attachment Filters (for attachment-related triggers)
		{
			displayName: 'Attachment Filters',
			name: 'attachmentFilters',
			type: 'collection',
			default: {},
			description: 'Advanced filters for attachment-related triggers',
			displayOptions: {
				show: {
					updates: ['attachmentReceived', 'attachmentUploaded'],
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
		// Contact Filters (for contact-related triggers)
		{
			displayName: 'Contact Filters',
			name: 'contactFilters',
			type: 'collection',
			default: {},
			description: 'Advanced filters for contact-related triggers',
			displayOptions: {
				show: {
					updates: ['contactNew', 'contactDeleted', 'contactDetailsUpdated', 'contactPhotoUpdated'],
				},
			},
			options: [
				{
					displayName: 'Display Name Contains',
					name: 'displayNameSearch',
					type: 'string',
					default: '',
					placeholder: 'John',
					description: 'Filter contacts whose display name contains this text',
				},
				{
					displayName: 'Position Contains',
					name: 'positionSearch',
					type: 'string',
					default: '',
					placeholder: 'Manager',
					description: 'Filter contacts whose position contains this text',
				},
				{
					displayName: 'Company Contains',
					name: 'companySearch',
					type: 'string',
					default: '',
					placeholder: 'Acme Corp',
					description: 'Filter contacts whose company contains this text',
				},
			],
		},
		// Group Filters (for group-related triggers)
		{
			displayName: 'Group Filters',
			name: 'groupFilters',
			type: 'collection',
			default: {},
			description: 'Advanced filters for group-related triggers',
			displayOptions: {
				show: {
					updates: [
						'groupNew',
						'groupDeleted',
						'groupNameUpdated',
						'groupPhotoUpdated',
						'groupDescriptionUpdated',
						'groupPendingMemberAdded',
						'groupPendingMemberRemoved',
						'groupMemberJoined',
						'groupMemberLeft',
						'groupOwnPermissionsUpdated',
						'groupMemberPermissionsUpdated',
					],
				},
			},
			options: [
				{
					displayName: 'Group Name Contains',
					name: 'nameSearch',
					type: 'string',
					default: '',
					placeholder: 'Project Team',
					description: 'Filter groups whose name contains this text',
				},
				{
					displayName: 'Group Description Contains',
					name: 'descriptionSearch',
					type: 'string',
					default: '',
					placeholder: 'Development',
					description: 'Filter groups whose description contains this text',
				},
			],
		},
		// Discussion Filters (for discussion-related triggers)
		{
			displayName: 'Discussion Filters',
			name: 'discussionFilters',
			type: 'collection',
			default: {},
			description: 'Advanced filters for discussion-related triggers',
			displayOptions: {
				show: {
					updates: [
						'discussionNew',
						'discussionLocked',
						'discussionTitleUpdated',
						'discussionSettingsUpdated',
					],
				},
			},
			options: [
				{
					displayName: 'Discussion Title Contains',
					name: 'titleSearch',
					type: 'string',
					default: '',
					placeholder: 'Meeting',
					description: 'Filter discussions whose title contains this text',
				},
				{
					displayName: 'Discussion Type',
					name: 'discussionType',
					type: 'options',
					options: [
						{ name: 'Any', value: 'TYPE_UNSPECIFIED' },
						{ name: 'One-to-One', value: 'TYPE_OTO' },
						{ name: 'Group', value: 'TYPE_GROUP' },
					],
					default: 'TYPE_UNSPECIFIED',
					description: 'Filter by discussion type',
				},
			],
		},
		// Invitation Filters (for invitation-related triggers)
		{
			displayName: 'Invitation Filters',
			name: 'invitationFilters',
			type: 'collection',
			default: {},
			description: 'Advanced filters for invitation-related triggers',
			displayOptions: {
				show: {
					updates: [
						'invitationReceived',
						'invitationSent',
						'invitationDeleted',
						'invitationUpdated',
					],
				},
			},
			options: [
				{
					displayName: 'Invitation Status',
					name: 'status',
					type: 'options',
					options: [
						{ name: 'Any', value: 'STATUS_UNSPECIFIED' },
						{
							name: 'Group Invitation Wait You',
							value: 'STATUS_GROUP_INVITATION_WAIT_YOU_TO_ACCEPT',
						},
						{ name: 'In Progress', value: 'STATUS_INVITATION_STATUS_IN_PROGRESS' },
						{ name: 'Wait Them to Accept', value: 'STATUS_INVITATION_WAIT_IT_TO_ACCEPT' },
						{ name: 'Wait You to Accept', value: 'STATUS_INVITATION_WAIT_YOU_TO_ACCEPT' },
					],
					default: 'STATUS_UNSPECIFIED',
					description: 'Filter by invitation status',
				},
				{
					displayName: 'Display Name Contains',
					name: 'displayNameSearch',
					type: 'string',
					default: '',
					placeholder: 'John',
					description: 'Filter invitations whose display name contains this text',
				},
			],
		},
	],
};
