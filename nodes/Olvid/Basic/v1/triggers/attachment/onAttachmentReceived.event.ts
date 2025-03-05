import { datatypes, OlvidClient } from "@olvid/bot-node";
import { IBinaryData, ITriggerFunctions } from "n8n-workflow";
import { formatFileSize } from "../../../../GenericFunctions";

export async function downloadAttachment(client: OlvidClient, attachment: datatypes.Attachment) {
    if (!attachment || !attachment.id) {
        throw new Error('No attachment found');
    }
    const chunks: Uint8Array[] = [];
    let totalLength = 0;
    for await (const chunk of await client.attachmentDownload({ attachmentId: attachment.id })) {
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

    return client.onAttachmentReceived({
        callback: async (attachment: datatypes.Attachment) => {
            console.log('Attachment Received');
            const binaryData = await downloadAttachment(client, attachment);
            this.emit([[{ json: { attachment: attachment }, binary: { data: binaryData } }]]);
            onCallback?.(); // For Manual Testing
        },
        endCallback: () => { }
    });
}
