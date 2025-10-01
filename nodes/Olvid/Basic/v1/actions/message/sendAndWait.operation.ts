/* eslint-disable n8n-nodes-base/node-param-display-name-miscased-id,n8n-nodes-base/node-param-description-miscased-id */
import { INodeProperties, updateDisplayOptions } from 'n8n-workflow';
import {discussionIdPicker} from "../../../../common-properties/discussionIdPicker";
import { WAIT_INDEFINITELY } from 'n8n-workflow';
import {
	type IExecuteFunctions,
	type IDataObject,
	type INodeExecutionData,
	SEND_AND_WAIT_OPERATION
} from 'n8n-workflow';
import { OlvidClient } from '../../../../client/OlvidClient';
import * as datatypes from '../../../../protobuf/olvid/daemon/datatypes/v1/datatypes';
import { create } from '@bufbuild/protobuf';


const properties: INodeProperties[] = [
	// # Discussion id
	{
		...discussionIdPicker,
		required: true,
	},
	{
		displayName: 'Message Mode',
		name: 'messageMode',
		type: 'options',
		default: 'sendMessage',
		options: [
			{
				name: 'Send Message',
				value: 'sendMessage',
				description: 'Send a new message and wait for responses',
			},
			{
				name: 'Use Message ID',
				value: 'useMessageId',
				description: 'Reference an existing message by ID',
			},
			{
				name: 'Do Not Send Message',
				value: 'noMessage',
				description: 'Wait for responses without sending a message',
			},
		],
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
				messageMode: ['sendMessage'],
			},
		},
		description: 'The message content to send',
	},
	{
		displayName: 'Message ID',
		name: 'messageId',
		type: 'number',
		required: true,
		default: 0,
		displayOptions: {
			show: {
				messageMode: ['useMessageId'],
			},
		},
		description: 'The ID of the existing message to reference',
	},
	{
		displayName: 'Response Type',
		name: 'responseType',
		type: 'options',
		default: 'messageApproval',
		displayOptions: {
			show: {
				messageMode: ['sendMessage', 'useMessageId'],
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
	{
		displayName: 'Response Type',
		name: 'responseType',
		type: 'options',
		default: 'messageApproval',
		displayOptions: {
			show: {
				messageMode: ['noMessage'],
			},
		},
		options: [
			{
				name: 'Message-based Approval',
				value: 'messageApproval',
				description: 'User responds with specific text messages (regex-based)',
			},
			{
				name: 'Free Text Response',
				value: 'freeText',
				description: 'User can respond with any text',
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
				responseType: ['reactionApproval', 'both'],
				reactionType: ['double'],
			},
		},
		description: 'Reaction emoji that counts as disapproval',
	},
	// Options (merged with response filters)
	{
		displayName: 'Options',
		name: 'options',
		type: 'collection',
		placeholder: 'Add option',
		default: {},
		options: [
			{
				displayName: 'Only from Specific Contact',
				name: 'specificContact',
				type: 'number',
				default: 0,
				description: 'Only accept responses from this contact ID (0 = anyone)',
			},
			{
				displayName: 'Only Replying to Sent Message',
				name: 'onlyReplies',
				type: 'boolean',
				default: false,
				description: 'Only accept messages that are replies to the sent message',
			},
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

const displayOptions = {
	show: {
		resource: ['message'],
		operation: [SEND_AND_WAIT_OPERATION],
	},
};

export const sendAndWaitParameters = updateDisplayOptions(displayOptions, properties);

// Send and wait configuration for Olvid
export type OlvidSendAndWaitConfig = {
	discussionId: number;
	messageMode: 'sendMessage' | 'useMessageId' | 'noMessage';
	message?: string;
	messageId?: number;
	responseType: 'messageApproval' | 'reactionApproval' | 'freeText' | 'both';
	approvalType?: 'single' | 'double';
	reactionType?: 'single' | 'double';
	approveRegex?: string;
	disapproveRegex?: string;
	approveReaction?: string;
	disapproveReaction?: string;
	specificContact?: number;
	onlyReplies: boolean;
	sendConfirmation: boolean;
};

// Create Olvid message
export async function createOlvidSendAndWaitMessage(context: IExecuteFunctions, index: number): Promise<{
	messageContent?: string;
	config: OlvidSendAndWaitConfig;
}> {
	const discussionPicker = context.getNodeParameter('discussionPicker', index) as IDataObject;
	const discussionId: number = discussionPicker ? discussionPicker["value"] as number : 0;

	const messageMode = context.getNodeParameter('messageMode', 0, 'sendMessage') as 'sendMessage' | 'useMessageId' | 'noMessage';
	const responseType = context.getNodeParameter('responseType', 0, 'messageApproval') as 'messageApproval' | 'reactionApproval' | 'freeText' | 'both';
	const options = context.getNodeParameter('options', 0, {}) as IDataObject;

	const config: OlvidSendAndWaitConfig = {
		discussionId,
		messageMode,
		responseType,
		specificContact: (options.specificContact as number) || 0,
		onlyReplies: (options.onlyReplies as boolean) || false,
		sendConfirmation: (options.sendConfirmation as boolean) || false,
	};

	// Handle different message modes
	if (messageMode === 'sendMessage') {
		config.message = context.getNodeParameter('message', 0) as string;
	} else if (messageMode === 'useMessageId') {
		config.messageId = context.getNodeParameter('messageId', 0) as number;
	}

	// Handle message-based responses
	if (responseType === 'messageApproval' || responseType === 'both') {
		const approvalType = context.getNodeParameter('approvalType', 0, 'double') as
			| 'single'
			| 'double';
		config.approvalType = approvalType;
		config.approveRegex = context.getNodeParameter(
			'approveRegex',
			0,
			'(?i)^(yes|approve|ok|accept|✓)$',
		) as string;

		if (approvalType === 'double') {
			config.disapproveRegex = context.getNodeParameter(
				'disapproveRegex',
				0,
				'(?i)^(no|reject|decline|cancel|✗)$',
			) as string;
		}
	}

	// Handle reaction-based responses
	if (responseType === 'reactionApproval' || responseType === 'both') {
		const reactionType = context.getNodeParameter('reactionType', 0, 'double') as
			| 'single'
			| 'double';
		config.reactionType = reactionType;
		config.approveReaction = context.getNodeParameter('approveReaction', 0, '👍') as string;

		if (reactionType === 'double') {
			config.disapproveReaction = context.getNodeParameter('disapproveReaction', 0, '👎') as string;
		}
	}

	return { messageContent: config.message, config };
}

// Configure wait time from parameters
export function configureOlvidWaitTillDate(context: IExecuteFunctions) {
	const options = context.getNodeParameter('options', 0, {}) as IDataObject;
	const limitOptions = options.limitWaitTime as { values?: IDataObject } | undefined;

	if (!limitOptions?.values) {
		return WAIT_INDEFINITELY;
	}

	const values = limitOptions.values;
	const limitType = values.limitType as string;

	if (limitType === 'afterTimeInterval') {
		let waitAmount = (values.resumeAmount as number) || 1;
		const resumeUnit = values.resumeUnit as string;

		if (resumeUnit === 'minutes') {
			waitAmount *= 60;
		} else if (resumeUnit === 'hours') {
			waitAmount *= 60 * 60;
		} else if (resumeUnit === 'days') {
			waitAmount *= 60 * 60 * 24;
		}

		waitAmount *= 1000;
		return new Date(new Date().getTime() + waitAmount);
	} else if (limitType === 'atSpecifiedTime') {
		return new Date(values.maxDateAndTime as string);
	}

	return WAIT_INDEFINITELY;
}

// Send message and setup listeners for responses using n8n's sendAndWait pattern
export async function executeSendAndWait(
	node: IExecuteFunctions,
	index: number,
	client: OlvidClient,
): Promise<INodeExecutionData[]> {
	const { messageContent, config } = await createOlvidSendAndWaitMessage(node, index);
	const waitTill = configureOlvidWaitTillDate(node);

	let sentMessageId: datatypes.MessageId|undefined = undefined;

	// Handle different message modes
	if (config.messageMode === 'sendMessage') {
		// Send a new message
		if (!messageContent) {
			throw new Error('Message content is required when using "Send Message" mode');
		}

		const messageResult = await client.messageSend({
			discussionId: BigInt(config.discussionId),
			body: messageContent,
		});

		sentMessageId = messageResult.id!;
	} else if (config.messageMode === 'useMessageId') {
		// Use existing message ID
		if (!config.messageId) {
			throw new Error('Message ID is required when using "Use Message ID" mode');
		}

		sentMessageId = create(datatypes.MessageIdSchema, {type: datatypes.MessageId_Type.OUTBOUND, id: BigInt(config.messageId)});
	}
	// For 'noMessage' mode, sentMessageId remains undefined

	// Validate reaction-based responses require a message ID
	if (
		(config.responseType === 'reactionApproval' || config.responseType === 'both') &&
		!sentMessageId
	) {
		throw new Error(
			'Message ID must be provided for reaction-based responses. Use "Send Message" or "Use Message ID" mode.',
		);
	}

	// Create a promise that resolves when we get a valid response
	return new Promise((resolve, reject) => {
		let isResolved = false;
		let timeoutId: NodeJS.Timeout | undefined;
		let approvalCancelFn: Function | undefined;
		let disapprovalCancelFn: Function | undefined;
		let reactionApproveCancelFn: Function | undefined;
		let reactionDisapproveCancelFn: Function | undefined;

		const cleanup = () => {
			isResolved = true;
			if (timeoutId) clearTimeout(timeoutId);
			if (approvalCancelFn) approvalCancelFn();
			if (disapprovalCancelFn) disapprovalCancelFn();
			if (reactionApproveCancelFn) reactionApproveCancelFn();
			if (reactionDisapproveCancelFn) reactionDisapproveCancelFn();
		};

		// Setup timeout
		if (waitTill !== WAIT_INDEFINITELY) {
			const timeoutMs = waitTill.getTime() - Date.now();
			if (timeoutMs > 0) {
				timeoutId = setTimeout(() => {
					if (!isResolved) {
						cleanup();
						resolve(
							node.helpers.returnJsonArray([
								{
									json: {
										sentMessageId,
										discussionId: config.discussionId,
										messageMode: config.messageMode,
										status: 'timeout',
										timestamp: new Date().toISOString(),
									},
									pairedItem: { item: index },
								},
							]),
						);
					}
				}, timeoutMs);
			}
		}

		const baseFilter = create(datatypes.MessageFilterSchema, {
			discussionId: BigInt(config.discussionId),
		});

		// Add sender filter if specified
		if (config.specificContact) {
			baseFilter.senderContactId = BigInt(config.specificContact);
		}

		// Add reply filter if specified and we have a message to reply to
		if (config.onlyReplies && sentMessageId) {
			baseFilter.reply = {
				case: 'repliedMessageId',
				value: sentMessageId,
			};
		}

		// Setup message listener for text-based responses
		if (
			config.responseType === 'messageApproval' ||
			config.responseType === 'freeText' ||
			config.responseType === 'both'
		) {
			approvalCancelFn = client.onMessageReceived({
				filter: create(datatypes.MessageFilterSchema, {
					...baseFilter,
					bodySearch: config.responseType === 'freeText' ? undefined : config.approveRegex,
				}),
				callback: async (message: datatypes.Message) => {
					if (isResolved) return;

					if (config.sendConfirmation && message.id?.id) {
						// Handle free text responses
						await client.messageReact({
							messageId: message.id,
							reaction: config.responseType === 'freeText' ? '👌' : '✅',
						});
					}

					cleanup();
					resolve(
						node.helpers.returnJsonArray([
							{
								json: {
									sentMessageId,
									discussionId: config.discussionId,
									messageMode: config.messageMode,
									status: 'resolved',
									responseType: config.responseType,
									approved: true,
									response: message.body,
									messageId: Number(message.id?.id),
									senderId: Number(message.senderId),
									timestamp: new Date().toISOString(),
								},
								pairedItem: { item: index },
							},
						]),
					);
				},
				count: BigInt(1),
			});

			if (config.responseType !== 'freeText' && config.approvalType === 'double') {
				disapprovalCancelFn = client.onMessageReceived({
					filter: create(datatypes.MessageFilterSchema, {
						...baseFilter,
						bodySearch: config.disapproveRegex,
					}),
					callback: async (message: datatypes.Message) => {
						if (isResolved) return;

						if (config.sendConfirmation && message.id?.id) {
							await client.messageReact({
								messageId: message.id,
								reaction: '❌',
							});
						}

						cleanup();
						resolve(
							node.helpers.returnJsonArray([
								{
									json: {
										sentMessageId,
										discussionId: config.discussionId,
										messageMode: config.messageMode,
										status: 'resolved',
										responseType: config.responseType,
										approved: false,
										response: message.body,
										messageId: Number(message.id?.id),
										senderId: Number(message.senderId),
										timestamp: new Date().toISOString(),
									},
									pairedItem: { item: index },
								},
							]),
						);
					},
					count: BigInt(1),
				});
			}
		}

		// Setup reaction listener for reaction-based responses
		if (config.responseType === 'reactionApproval' || config.responseType === 'both') {
			if (!sentMessageId) {
				reject(new Error('Message ID must be provided for reaction-based responses'));
				return;
			}

			const baseReactionFilter = create(datatypes.ReactionFilterSchema, {
				reactedBy: config.specificContact
					? { value: BigInt(config.specificContact), case: 'reactedByContactId' }
					: undefined,
			});

			reactionApproveCancelFn = client.onMessageReactionAdded({
				messageIds: [sentMessageId],
				reactionFilter: create(datatypes.ReactionFilterSchema, {
					...baseReactionFilter,
					reaction: config.approveReaction || '👍',
				}),
				callback: async (message: datatypes.Message, reaction: datatypes.MessageReaction) => {
					if (isResolved) return;

					if (config.sendConfirmation && message.id?.id) {
						await client.messageReact({
							messageId: message.id,
							reaction: '✅',
						});
					}

					// Resolve the execution
					cleanup();
					resolve(
						node.helpers.returnJsonArray([
							{
								json: {
									sentMessageId,
									discussionId: config.discussionId,
									messageMode: config.messageMode,
									status: 'resolved',
									responseType: 'reactionApproval',
									approved: true,
									reaction: reaction.reaction,
									messageId: sentMessageId,
									contactId: Number(reaction.contactId),
									timestamp: new Date().toISOString(),
								},
								pairedItem: { item: index },
							},
						]),
					);
				},
				count: BigInt(1),
			});

			if (config.reactionType === 'double') {
				reactionDisapproveCancelFn = client.onMessageReactionAdded({
					messageIds: [sentMessageId],
					reactionFilter: create(datatypes.ReactionFilterSchema, {
						...baseReactionFilter,
						reaction: config.disapproveReaction || '👎',
					}),
					callback: async (message: datatypes.Message, reaction: datatypes.MessageReaction) => {
						if (isResolved) return;

						if (config.sendConfirmation && message.id?.id) {
							await client.messageReact({
								messageId: message.id,
								reaction: '❌',
							});
						}

						cleanup();
						resolve(
							node.helpers.returnJsonArray([
								{
									json: {
										sentMessageId,
										discussionId: config.discussionId,
										messageMode: config.messageMode,
										status: 'resolved',
										responseType: 'reactionApproval',
										approved: false,
										reaction: reaction.reaction,
										messageId: sentMessageId,
										contactId: Number(reaction.contactId),
										timestamp: new Date().toISOString(),
									},
									pairedItem: { item: index },
								},
							]),
						);
					},
					count: BigInt(1),
				});
			}
		}
	});
}
