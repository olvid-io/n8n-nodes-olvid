import { datatypes, OlvidClient } from "@olvid/bot-node";
import { IBinaryData, ITriggerFunctions } from "n8n-workflow";
import { downloadAttachment } from "../attachment/onAttachmentReceived.event";

export function messageReceived(this: ITriggerFunctions, client: OlvidClient, onCallback?: Function, returnMockData: Boolean = false): Function {
    const downloadAttachments = this.getNodeParameter('downloadAttachments') as boolean ?? false;
    if (returnMockData) {
        this.emit([this.helpers.returnJsonArray([{
            "body": "Welcome to Olvid!",
            "id": {
                "type": "TYPE_INBOUND",
                "id": 0
            },
            "discussionId": 0,
            "senderId": 0,
            "sortIndex": 0,
            "timestamp": 0,
            "attachmentsCount": 0,
            "reactions": [],
        }])]);
        onCallback?.();
        return () => { };
    }

    return client.onMessageReceived({
        callback: async (message: datatypes.Message) => {
            let attachments: IBinaryData[] = [];
            if (downloadAttachments && message.attachmentsCount > 0) {
                for await (const attachment of client.attachmentList({ filter: new datatypes.AttachmentFilter({ messageId: message.id }) })) {
                    attachments.push(await downloadAttachment(client, attachment));
                }
            }
            this.emit([[{
                json: { "message": message }, ...(attachments.length > 0 ? {
                    binary: Object.fromEntries(
                        attachments.map((attachment, index) => [`data${index}`, attachment])
                    ),
                } : null)
            }]]);
            onCallback?.(); // For Manual Testing
        },
        endCallback: () => {
            onCallback?.();
        }
    });
}
