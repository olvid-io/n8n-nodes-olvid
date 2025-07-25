import { OlvidClient } from '../../../../client/OlvidClient';
import * as datatypes from '../../../../protobuf/olvid/daemon/datatypes/v1/datatypes';
import { IBinaryData, ITriggerFunctions } from 'n8n-workflow';
import { downloadAttachment } from '../attachment/onAttachmentReceived.event';
import {
	buildMessageFilter,
	buildLegacyMessageFilter,
} from '../../../../common-methods/filterHelpers';

export function messageReceived(
	this: ITriggerFunctions,
	client: OlvidClient,
	onCallback?: Function,
	returnMockData: Boolean = false,
): Function {
	const downloadAttachments = (this.getNodeParameter('downloadAttachments') as boolean) ?? false;

	if (returnMockData) {
		this.emit([
			this.helpers.returnJsonArray([
				{
					body: 'Welcome to Olvid!',
					id: {
						type: 'TYPE_INBOUND',
						id: 0,
					},
					discussionId: 0,
					senderId: 0,
					sortIndex: 0,
					timestamp: 0,
					attachmentsCount: 0,
					reactions: [],
				},
			]),
		]);
		onCallback?.();
		return () => {};
	}

	// Build filter from new messageFilters collection or legacy bodyRegexpFilter
	let filter: datatypes.MessageFilter | undefined;

	// Try new filter format first
	filter = buildMessageFilter(this);

	// If no new filter, try legacy format for backward compatibility
	if (!filter) {
		filter = buildLegacyMessageFilter(this);
	}

	return client.onMessageReceived({
		callback: async (message: datatypes.Message) => {
			let attachmentsData: IBinaryData[] = [];
			let attachments: datatypes.Attachment[] = [];
			for await (const attachment of client.attachmentList({
				filter: new datatypes.AttachmentFilter({ messageId: message.id }),
			})) {
				attachments.push(attachment);
				attachmentsData.push(await downloadAttachment(client, attachment));
			}
			this.emit([
				[
					{
						json: { message: message, attachments: attachments },
						...(downloadAttachments && attachmentsData.length > 0
							? {
									binary: Object.fromEntries(
										attachmentsData.map((attachment, index) => [`data${index}`, attachment]),
									),
								}
							: null),
					},
				],
			]);
			onCallback?.(); // For Manual Testing
		},
		endCallback: () => {
			onCallback?.();
		},
		filter: filter,
	});
}
