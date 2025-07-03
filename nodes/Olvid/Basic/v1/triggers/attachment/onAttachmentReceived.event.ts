import { OlvidClient } from "../../../../client/OlvidClient";
import * as datatypes from '../../../../protobuf/olvid/daemon/datatypes/v1/datatypes';
import { IBinaryData, ITriggerFunctions } from "n8n-workflow";
import { formatFileSize } from "../../../../GenericFunctions";

export async function downloadAttachment(client: OlvidClient, attachment: datatypes.Attachment) {
    if (!attachment || !attachment.id) {
        throw new Error('No attachment found');
    }
    const chunks: Uint8Array[] = [];
    let totalLength = 0;
    for await (const chunk of client.attachmentDownload({ attachmentId: attachment.id })) {
        chunks.push(chunk);
        totalLength += chunk.length;
    }
    const binaryData: IBinaryData = {
        data: Buffer.concat(chunks, totalLength).toString('base64'),
        mimeType: attachment.mimeType,
        fileName: attachment.fileName,
        fileSize: formatFileSize(attachment.size),
        fileExtension: attachment.fileName.split('.').pop() || ''
    };
    return binaryData
}


export function attachmentReceived(this: ITriggerFunctions, client: OlvidClient, onCallback?: Function, returnMockData: Boolean = false): Function {
    if (returnMockData) {
        this.emit([this.helpers.returnJsonArray([{
            "attachment": {
                "id": {
                    "type": "TYPE_INBOUND",
                    "id": 0
                },
                "discussionId": 0,
                "messageId": {
                    "type": "TYPE_INBOUND",
                    "id": 0
                },
                "fileName": "Recording @ 2024-12-13 23-30-14.m4a",
                "mimeType": "audio/x-m4a",
                "size": 0
            },
        }])]);
        onCallback?.();
        return () => { };
    }

		const downloadAttachments = this.getNodeParameter('downloadAttachments') as boolean ?? false;
    return client.onAttachmentReceived({
        callback: async (attachment: datatypes.Attachment) => {
            console.log('Attachment Received');
						this.emit([[{ json: { attachment: attachment }, ...(downloadAttachments ? { binary: { data: await downloadAttachment(client, attachment) } } : null )}]]);
            onCallback?.(); // For Manual Testing
        },
        endCallback: () => { }
    });
}
