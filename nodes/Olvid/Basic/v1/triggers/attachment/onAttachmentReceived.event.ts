import { OlvidClient } from '../../../../client/OlvidClient';
import * as datatypes from '../../../../protobuf/olvid/daemon/datatypes/v1/datatypes';
import { IBinaryData, ITriggerFunctions } from 'n8n-workflow';
import { buildAttachmentFilter } from '../../../../common-methods/filterHelpers';

export async function downloadAttachment(
	client: OlvidClient,
	attachment: datatypes.Attachment,
): Promise<IBinaryData> {
	if (!attachment.id) {
		throw new Error('Attachment ID is missing');
	}

	let fileName = attachment.fileName ?? `attachment_${attachment.id.id}`;

	// Remove invalid characters from filename
	fileName = fileName.replace(/[<>:"/\\|?*]/g, '_');

	// Collect all chunks from the async iterable
	const chunks: Uint8Array[] = [];
	let totalLength = 0;
	for await (const chunk of client.attachmentDownload({ attachmentId: attachment.id })) {
		chunks.push(chunk);
		totalLength += chunk.length;
	}

	return {
		data: Buffer.concat(chunks, totalLength).toString('base64'),
		mimeType: attachment.mimeType ?? 'application/octet-stream',
		fileName: fileName,
		fileSize: attachment.size ? attachment.size.toString() : undefined,
	};
}

export function attachmentReceived(
	this: ITriggerFunctions,
	client: OlvidClient,
	onCallback?: Function,
	returnMockData: Boolean = false,
): Function {
	const downloadAttachments = (this.getNodeParameter('downloadAttachments') as boolean) ?? true;

	if (returnMockData) {
		this.emit([
			this.helpers.returnJsonArray([
				{
					id: {
						type: 'TYPE_INBOUND',
						id: 0,
					},
					discussionId: 0,
					messageId: {
						type: 'TYPE_INBOUND',
						id: 0,
					},
					fileName: 'image.jpg',
					mimeType: 'image/jpeg',
					size: 123456,
				},
			]),
		]);
		onCallback?.();
		return () => {};
	}

	// Build filter from attachmentFilters collection
	const filter = buildAttachmentFilter(this);

	return client.onAttachmentReceived({
		callback: async (attachment: datatypes.Attachment) => {
			let attachmentData: IBinaryData | undefined;

			if (downloadAttachments) {
				try {
					attachmentData = await downloadAttachment(client, attachment);
				} catch (error) {
					console.error('Failed to download attachment:', error);
				}
			}

			this.emit([
				[
					{
						json: { attachment: attachment },
						...(attachmentData ? { binary: { data: attachmentData } } : {}),
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
