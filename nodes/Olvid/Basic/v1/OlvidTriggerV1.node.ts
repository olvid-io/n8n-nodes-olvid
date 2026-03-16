/* eslint-disable n8n-nodes-base/node-class-description-inputs-wrong-regular-node */
import {
	ApplicationError,
	IBinaryData,
	IDataObject,
	INodeType,
	INodeTypeBaseDescription,
	INodeTypeDescription,
	ITriggerFunctions,
	ITriggerResponse,
	NodeConnectionTypes,
} from 'n8n-workflow';

import { testOlvidCredentials } from '../../common-properties/testOlvidCredentials';
import { OlvidClientSingleton } from '../../utils/OlvidClientSingleton';
import { buildDryRunMessage } from '../../Advanced/v1/buildDryRunMessage';
import { create, Message } from '@bufbuild/protobuf';
import { buildResponseMessage } from '../../Advanced/v1/convertProtobufToN8n';
import * as notifications from '../../protobuf/olvid/daemon/notification/v1/notification';
import { ConnectError } from '@connectrpc/connect';
import { properties } from './triggers/properties';
import { OlvidClient } from '../../client/OlvidClient';
import { formatFileSize } from '../../utils/GenericFunctions';
import { contactSearch } from '../../common-properties/contactIdPicker';
import { discussionSearch } from '../../common-properties/discussionIdPicker';

export class OlvidTriggerV1 implements INodeType {
	description: INodeTypeDescription;

	constructor(baseDescription: INodeTypeBaseDescription) {
		this.description = {
			...baseDescription,
			displayName: 'Olvid Trigger',
			name: 'olvidTrigger',
			group: ['trigger'],
			version: 1,
			description: 'Start the workflow on Olvid update',
			defaults: {
				name: 'Olvid Trigger',
			},
			inputs: [],
			outputs: [NodeConnectionTypes.Main],
			credentials: [
				{ name: 'olvidApi', required: true, testedBy: 'testOlvidDaemon' },
			],
			triggerPanel: {
				header: 'Pull in events from Olvid',
				executionsHelp: {
					inactive:
						"<b>While building your workflow</b>, click the 'listen' button, then send a message, a reaction or an attachment to make an event happen. This will trigger an execution, which will show up in this editor.<br /> <br /><b>Once you're happy with your workflow</b>, <a data-key='activate'>activate</a> it. Then every time an Olvid event is received, the workflow will execute. These executions will show up in the <a data-key='executions'>executions list</a>, but not in the editor.",
					active:
						"<b>While building your workflow</b>, click the 'listen' button, then send a message, a reaction or an attachment to make an event happen. This will trigger an execution, which will show up in this editor.<br /> <br /><b>Your workflow will also execute automatically</b>, since it's activated. Every time an Olvid event is received, this node will trigger an execution. These executions will show up in the <a data-key='executions'>executions list</a>, but not in the editor.",
				},
				activationHint: 'Prepare yourself to trigger an Olvid Event',
			},
			properties: properties,
		};
	}

	methods = {
		listSearch: { contactSearch, discussionSearch },
		credentialTest: { testOlvidDaemon: testOlvidCredentials },
	};

	async trigger(this: ITriggerFunctions): Promise<ITriggerResponse> {
		const credentials = (await this.getCredentials('olvidApi')) as {
			clientKey: string;
			daemonEndpoint: string;
		};
		const client = OlvidClientSingleton.getInstance(credentials);

		// retrieve trigger information
		const triggerName: string = this.getNodeParameter('updates') as string;

		// dry mode: build an example notification by filling all fields with data and return it (we do not want to use connection to daemon or parse parameters)
		let dryMode: boolean = false;
		if (
			this.getMode() === 'manual' &&
			(this.getNodeParameter('dry-run') as boolean)
		) {
			dryMode = true;
		}

		// called on grpc stub closure
		const stubCloseCallback = (error: ConnectError | undefined) => {
			if (error) {
				console.error(`${triggerName}: ConnectionError`, error);
				this.emitError(error);
			}
		};

		if (triggerName === 'messageReceived') {
			return handleMessageReceived(client, stubCloseCallback, this, dryMode);
		} else if (triggerName === 'reactionAdded') {
			return handleReactionAdded(client, stubCloseCallback, this, dryMode);
		} else if (triggerName === 'attachmentReceived') {
			return handleAttachmentReceived(client, stubCloseCallback, this, dryMode);
		} else {
			throw new ApplicationError(`Invalid update name: ${triggerName}`);
		}
	}
}

async function handleMessageReceived(
	client: OlvidClient,
	stubCloseCallback: (error: ConnectError | undefined) => any,
	node: ITriggerFunctions,
	dryMode: boolean,
): Promise<ITriggerResponse> {
	// parse parameters
	const messageFilters = node.getNodeParameter('messageFilters') as IDataObject;
	messageFilters['discussionId'] = messageFilters['discussionPicker']
		? (messageFilters['discussionPicker'] as IDataObject)['value']
		: undefined;
	messageFilters['senderContactId'] = messageFilters['contactPicker']
		? (messageFilters['contactPicker'] as IDataObject)['value']
		: undefined;
	const filter: notifications.SubscribeToMessageReceivedNotification = create(
		notifications.SubscribeToMessageReceivedNotificationSchema,
		{
			filter: {
				bodySearch: messageFilters['bodySearch']
					? (messageFilters['bodySearch'] as string)
					: undefined,
				discussionId: messageFilters['discussionId']
					? BigInt(messageFilters['discussionId'] as number)
					: undefined,
				senderContactId: messageFilters['senderContactId']
					? BigInt(messageFilters['senderContactId'] as number)
					: undefined,
				attachment: messageFilters['hasAttachments']
					? (messageFilters['hasAttachments'] as number)
					: undefined,
				hasReaction: messageFilters['hasReaction']
					? (messageFilters['hasReaction'] as number)
					: undefined,
				location: messageFilters['hasLocation']
					? (messageFilters['hasLocation'] as number)
					: undefined,
			},
			count: node.getMode() === 'manual' ? BigInt(1) : undefined,
		},
	);

	// dry run return a fake message and a fake file if download attachments was enabled
	if (dryMode) {
		return {
			closeFunction: async () => {},
			manualTriggerFunction: async () => {
				node.emit([
					buildDryRunMessage(
						notifications.MessageReceivedNotificationSchema,
						node.helpers.returnJsonArray,
					),
				]);
			},
		};
	}

	const notificationCallback = (notificationMessage: Message) => {
		node.emit([
			buildResponseMessage(
				notificationMessage,
				notifications.MessageReceivedNotificationSchema,
				node.helpers.returnJsonArray,
			),
		]);
	};

	const cancelFn = client.stubs.messageNotificationStub.messageReceived(
		filter,
		notificationCallback,
		stubCloseCallback,
	);
	return {
		closeFunction: async () => {
			cancelFn();
		},
	};
}

async function handleReactionAdded(
	client: OlvidClient,
	stubCloseCallback: (error: ConnectError | undefined) => any,
	node: ITriggerFunctions,
	dryMode: boolean,
): Promise<ITriggerResponse> {
	// parse parameters
	const messageFilters = node.getNodeParameter('messageFilters') as IDataObject;
	const reactionFilters = node.getNodeParameter(
		'reactionFilters',
	) as IDataObject;
	messageFilters['discussionId'] = messageFilters['discussionPicker']
		? (messageFilters['discussionPicker'] as IDataObject)['value']
		: undefined;
	messageFilters['senderContactId'] = messageFilters['contactPicker']
		? (messageFilters['contactPicker'] as IDataObject)['value']
		: undefined;
	const filter: notifications.SubscribeToMessageReactionAddedNotification =
		create(notifications.SubscribeToMessageReactionAddedNotificationSchema, {
			filter: {
				bodySearch: messageFilters['bodySearch']
					? (messageFilters['bodySearch'] as string)
					: undefined,
				discussionId: messageFilters['discussionId']
					? BigInt(messageFilters['discussionId'] as number)
					: undefined,
				senderContactId: messageFilters['senderContactId']
					? BigInt(messageFilters['senderContactId'] as number)
					: undefined,
			},
			reactionFilter: {
				reaction: reactionFilters['reaction']
					? (reactionFilters['reaction'] as string)
					: undefined,
				reactedBy: reactionFilters['reactedByContactId']
					? {
							case: 'reactedByContactId',
							value: BigInt(reactionFilters['reactedByContactId'] as number),
						}
					: undefined,
			},
			count: node.getMode() === 'manual' ? BigInt(1) : undefined,
		});

	if (dryMode) {
		return {
			closeFunction: async () => {},
			manualTriggerFunction: async () => {
				node.emit([
					buildDryRunMessage(
						notifications.MessageReactionAddedNotificationSchema,
						node.helpers.returnJsonArray,
					),
				]);
			},
		};
	}

	const notificationCallback = (notificationMessage: Message) => {
		node.emit([
			buildResponseMessage(
				notificationMessage,
				notifications.MessageReactionAddedNotificationSchema,
				node.helpers.returnJsonArray,
			),
		]);
	};

	const cancelFn = client.stubs.messageNotificationStub.messageReactionAdded(
		filter,
		notificationCallback,
		stubCloseCallback,
	);
	return {
		closeFunction: async () => {
			cancelFn();
		},
	};
}

async function handleAttachmentReceived(
	client: OlvidClient,
	stubCloseCallback: (error: ConnectError | undefined) => any,
	node: ITriggerFunctions,
	dryMode: boolean,
): Promise<ITriggerResponse> {
	// parse parameters
	const downloadAttachments =
		(node.getNodeParameter('downloadAttachments') as boolean) ?? false;
	const attachmentFilters = node.getNodeParameter(
		'attachmentFilters',
	) as IDataObject;
	attachmentFilters['discussionId'] = attachmentFilters['discussionPicker']
		? (attachmentFilters['discussionPicker'] as IDataObject)['value']
		: undefined;
	const filter: notifications.SubscribeToAttachmentReceivedNotification =
		create(notifications.SubscribeToAttachmentReceivedNotificationSchema, {
			filter: {
				filenameSearch: attachmentFilters['filenameSearch']
					? (attachmentFilters['filenameSearch'] as string)
					: undefined,
				mimeTypeSearch: attachmentFilters['mimeTypeSearch']
					? (attachmentFilters['mimeTypeSearch'] as string)
					: undefined,
				minSize: attachmentFilters['minSize']
					? BigInt(attachmentFilters['minSize'] as number)
					: undefined,
				maxSize: attachmentFilters['maxSize']
					? BigInt(attachmentFilters['maxSize'] as number)
					: undefined,
				discussionId: attachmentFilters['discussionId']
					? BigInt(attachmentFilters['discussionId'] as number)
					: undefined,
				fileType: attachmentFilters['fileType']
					? (attachmentFilters['fileType'] as number)
					: undefined,
			},
			count: node.getMode() === 'manual' ? BigInt(1) : undefined,
		});

	// dry mode
	if (dryMode) {
		return {
			closeFunction: async () => {},
			manualTriggerFunction: async () => {
				const dryRunMessage = buildDryRunMessage(
					notifications.AttachmentReceivedNotificationSchema,
					node.helpers.returnJsonArray,
				);
				if (downloadAttachments) {
					const dryRunFile: IBinaryData = {
						data: 'VXNlIE9sdmlkICE=',
						mimeType: 'text/plain',
						fileName: 'example.txt',
						fileSize: formatFileSize(BigInt(11)),
						fileExtension: 'txt',
					};
					dryRunMessage[0].binary = { data: dryRunFile };
				}
				node.emit([dryRunMessage]);
			},
		};
	}

	const notificationCallback = async (
		notification: notifications.AttachmentReceivedNotification,
	) => {
		// download attachment
		const chunks: Uint8Array[] = [];
		let totalLength = 0;
		for await (const chunk of client.attachmentDownload({
			attachmentId: notification.attachment!.id!,
		})) {
			chunks.push(chunk);
			totalLength += chunk.length;
		}

		const binaryData: IBinaryData = {
			data: Buffer.concat(chunks, totalLength).toString('base64'),
			mimeType: notification.attachment!.mimeType,
			fileName: notification.attachment!.fileName,
			fileSize: formatFileSize(notification.attachment!.size),
			fileExtension: notification.attachment!.fileName.split('.').pop() || '',
		};

		const responseMessage = buildResponseMessage(
			notification,
			notifications.AttachmentReceivedNotificationSchema,
			node.helpers.returnJsonArray,
		);
		responseMessage[0].binary = { data: binaryData };
		node.emit([responseMessage]);
	};

	const cancelFn = client.stubs.attachmentNotificationStub.attachmentReceived(
		filter,
		notificationCallback,
		stubCloseCallback,
	);
	return {
		closeFunction: async () => {
			cancelFn();
		},
	};
}
