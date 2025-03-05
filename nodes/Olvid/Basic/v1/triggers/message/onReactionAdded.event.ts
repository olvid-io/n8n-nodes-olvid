import { datatypes, OlvidClient } from "@olvid/bot-node";
import { ITriggerFunctions } from "n8n-workflow";

export function reactionAdded(this: ITriggerFunctions, client: OlvidClient, onCallback?: Function, returnMockData: Boolean = false): Function {
    if (returnMockData) {
        this.emit([this.helpers.returnJsonArray([{
            "message": {
                "id": {
                    "type": "TYPE_OUTBOUND",
                    "id": 0
                },
                "discussionId": 0,
                "senderId": 0,
                "body": "Welcome to Olvid!",
                "sortIndex": 0,
                "timestamp": 0,
                "attachmentsCount": 0,
                "reactions": [{
                    "contactId": 0,
                    "reaction": "👍",
                    "timestamp": 0
                }]
            },
            "reaction": {
                "contactId": 0,
                "reaction": "👍",
                "timestamp": 0
            }
        }])]);
        onCallback?.();
        return () => { };
    }

    return client.onMessageReactionAdded({
        callback: (message: datatypes.Message, reaction: datatypes.MessageReaction) => {
            this.emit([this.helpers.returnJsonArray([{ "message": message, "reaction": reaction}])]);
            onCallback?.(); // For Manual Testing
        },
        endCallback: () => { }
    });
}
