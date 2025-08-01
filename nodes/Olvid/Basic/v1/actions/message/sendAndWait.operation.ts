import type { INodeProperties } from 'n8n-workflow';
import { SEND_AND_WAIT_OPERATION } from 'n8n-workflow';

export const description: INodeProperties[] = [
	{
		displayName: 'Discussion ID',
		name: 'discussionId',
		type: 'number',
		required: true,
		default: 0,
		displayOptions: {
			show: {
				resource: ['message'],
				operation: [SEND_AND_WAIT_OPERATION],
			},
		},
		description: 'The ID of the discussion to send the message to',
	},
	{
		displayName: 'Message',
		name: 'message',
		type: 'string',
		default: '',
		required: true,
		typeOptions: {
			rows: 4,
		},
		displayOptions: {
			show: {
				resource: ['message'],
				operation: [SEND_AND_WAIT_OPERATION],
			},
		},
		description: 'The message content to send',
	},
	{
		displayName: 'Response Type',
		name: 'responseType',
		type: 'options',
		default: 'messageApproval',
		displayOptions: {
			show: {
				resource: ['message'],
				operation: [SEND_AND_WAIT_OPERATION],
			},
		},
		options: [
			{
				name: 'Message-based Approval',
				value: 'messageApproval',
				description: 'User responds with specific text messages (regex-based)',
			},
			{
				name: 'Reaction-based Approval',
				value: 'reactionApproval',
				description: 'User responds with specific reaction emojis',
			},
			{
				name: 'Free Text Response',
				value: 'freeText',
				description: 'User can respond with any text',
			},
			{
				name: 'Both Message and Reaction',
				value: 'both',
				description: 'Accept both text messages and reactions',
			},
		],
	},
	// Message-based approval options
	{
		displayName: 'Approval Type',
		name: 'approvalType',
		type: 'options',
		default: 'double',
		displayOptions: {
			show: {
				resource: ['message'],
				operation: [SEND_AND_WAIT_OPERATION],
				responseType: ['messageApproval', 'both'],
			},
		},
		options: [
			{
				name: 'Approve Only',
				value: 'single',
				description: 'Only accept approval responses',
			},
			{
				name: 'Approve and Disapprove',
				value: 'double',
				description: 'Accept both approval and disapproval responses',
			},
		],
	},
	{
		displayName: 'Approval Response (Regex)',
		name: 'approveRegex',
		type: 'string',
		default: '(?i)^(yes|approve|ok|accept|✓)$',
		displayOptions: {
			show: {
				resource: ['message'],
				operation: [SEND_AND_WAIT_OPERATION],
				responseType: ['messageApproval', 'both'],
			},
		},
		description:
			'Regular expression pattern for approval messages. Use (?i) for case-insensitive matching.',
	},
	{
		displayName: 'Disapproval Response (Regex)',
		name: 'disapproveRegex',
		type: 'string',
		default: '(?i)^(no|reject|decline|cancel|✗)$',
		displayOptions: {
			show: {
				resource: ['message'],
				operation: [SEND_AND_WAIT_OPERATION],
				responseType: ['messageApproval', 'both'],
				approvalType: ['double'],
			},
		},
		description:
			'Regular expression pattern for disapproval messages. Use (?i) for case-insensitive matching.',
	},
	// Reaction-based approval options
	{
		displayName: 'Reaction Type',
		name: 'reactionType',
		type: 'options',
		default: 'double',
		displayOptions: {
			show: {
				resource: ['message'],
				operation: [SEND_AND_WAIT_OPERATION],
				responseType: ['reactionApproval', 'both'],
			},
		},
		options: [
			{
				name: 'Approve Only',
				value: 'single',
				description: 'Only accept approval reactions',
			},
			{
				name: 'Approve and Disapprove',
				value: 'double',
				description: 'Accept both approval and disapproval reactions',
			},
		],
	},
	{
		displayName: 'Approve Reaction',
		name: 'approveReaction',
		type: 'string',
		default: '👍',
		displayOptions: {
			show: {
				resource: ['message'],
				operation: [SEND_AND_WAIT_OPERATION],
				responseType: ['reactionApproval', 'both'],
			},
		},
		description: 'Reaction emoji that counts as approval',
	},
	{
		displayName: 'Disapprove Reaction',
		name: 'disapproveReaction',
		type: 'string',
		default: '👎',
		displayOptions: {
			show: {
				resource: ['message'],
				operation: [SEND_AND_WAIT_OPERATION],
				responseType: ['reactionApproval', 'both'],
				reactionType: ['double'],
			},
		},
		description: 'Reaction emoji that counts as disapproval',
	},
	// Response filtering options
	{
		displayName: 'Response Filters',
		name: 'responseFilters',
		type: 'collection',
		placeholder: 'Add filter',
		default: {},
		displayOptions: {
			show: {
				resource: ['message'],
				operation: [SEND_AND_WAIT_OPERATION],
			},
		},
		options: [
			{
				displayName: 'Only from Specific Contact',
				name: 'specificContact',
				type: 'number',
				default: 0,
				description: 'Only accept responses from this contact ID (0 = anyone)',
			},
		],
	},
	// Timing and confirmation options
	{
		displayName: 'Options',
		name: 'options',
		type: 'collection',
		placeholder: 'Add option',
		default: {},
		displayOptions: {
			show: {
				resource: ['message'],
				operation: [SEND_AND_WAIT_OPERATION],
			},
		},
		options: [
			{
				displayName: 'Limit Wait Time',
				name: 'limitWaitTime',
				type: 'fixedCollection',
				description:
					'Whether the workflow will automatically resume execution after the specified limit',
				default: {
					values: { limitType: 'afterTimeInterval', resumeAmount: 45, resumeUnit: 'minutes' },
				},
				options: [
					{
						displayName: 'Values',
						name: 'values',
						values: [
							{
								displayName: 'Limit Type',
								name: 'limitType',
								type: 'options',
								default: 'afterTimeInterval',
								options: [
									{
										name: 'After Time Interval',
										value: 'afterTimeInterval',
									},
									{
										name: 'At Specified Time',
										value: 'atSpecifiedTime',
									},
								],
							},
							{
								displayName: 'Amount',
								name: 'resumeAmount',
								type: 'number',
								displayOptions: {
									show: {
										limitType: ['afterTimeInterval'],
									},
								},
								typeOptions: {
									minValue: 0,
									numberPrecision: 2,
								},
								default: 1,
								description: 'The time to wait',
							},
							{
								displayName: 'Unit',
								name: 'resumeUnit',
								type: 'options',
								displayOptions: {
									show: {
										limitType: ['afterTimeInterval'],
									},
								},
								options: [
									{
										name: 'Minutes',
										value: 'minutes',
									},
									{
										name: 'Hours',
										value: 'hours',
									},
									{
										name: 'Days',
										value: 'days',
									},
								],
								default: 'hours',
								description: 'Unit of the interval value',
							},
							{
								displayName: 'Max Date and Time',
								name: 'maxDateAndTime',
								type: 'dateTime',
								displayOptions: {
									show: {
										limitType: ['atSpecifiedTime'],
									},
								},
								default: '',
								description: 'Continue execution after the specified date and time',
							},
						],
					},
				],
			},
			{
				displayName: 'Send Confirmation Reaction',
				name: 'sendConfirmation',
				type: 'boolean',
				default: false,
				description: 'Whether to add a reaction to the user response to confirm receipt',
			},
		],
	},
];
