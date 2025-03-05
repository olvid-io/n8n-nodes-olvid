import { type IExecuteFunctions, type IDataObject, type INodeExecutionData, type INodeProperties, updateDisplayOptions } from 'n8n-workflow';

import { datatypes, OlvidClient } from '@olvid/bot-node';
import { discussionId, getDiscussionIdRequired } from '../properties/discussionId';
import { propNames } from '../properties/propertiesNames';
import { createDurationPropertyOptions, getDurationInSeconds } from '../properties/duration';
import { getMessageIdCollection, messageId, messageIdType } from '../properties/messageId';

const properties: INodeProperties[] = [
    // # Discussion id
    {
        ...discussionId,
        required: true,
    },

    // # MessageText
    {
        displayName: 'Text',
        name: 'text',
        type: 'string',
        default: '',
        description: 'Text of the message to be sent',
    },

    // # MessageFile
    {
        displayName: 'Files',
        name: propNames.files,
        type: 'fixedCollection',
        placeholder: 'Add Files',
        typeOptions: {
            multipleValues: true,
        },
        default: [],
        options: [
            {
                displayName: 'Values',
                name: 'values',
                values: [
                    {
                        displayName: 'Use Base64 Data',
                        name: 'isBase64',
                        type: 'boolean',
                        default: false,
                    },
                    {
                        displayName: 'File Name',
                        name: 'fileName',
                        type: 'string',
                        default: 'file.txt',
                        description: 'The name of the file being sent with the message',
                        placeholder: 'e.g. file.txt',
                        hint: 'The name of the file being sent with the message',
                        displayOptions: { show: { isBase64: [true] } },
                    },
                    {
                        displayName: 'File Data',
                        name: 'fileData',
                        type: 'string',
                        default: 'data',
                        description: 'The data of the file being sent with the message',
                        placeholder: 'e.g. data',
                        hint: 'The data of the file being sent with the message',
                        displayOptions: { show: { isBase64: [true] } },
                    },
                    {
                        displayName: 'Input Binary Field',
                        name: 'binaryPropertyName',
                        type: 'string',
                        default: 'data',
                        required: true,
                        placeholder: 'e.g. data',
                        hint: 'The name of the input binary field(s) containing the file(s) to decompress',
                        description: 'The name of the file being sent with the message',
                        displayOptions: { show: { isBase64: [false] } },
                    },
                ],
            },
        ],
    },

    //* -- Additional Fields --
    {
        displayName: 'Additional Fields',
        name: 'additionalFields',
        type: 'collection',
        placeholder: 'Add Field',
        default: {},
        options: [
            // # MessageReadOnce
            {
                displayName: 'Read Once',
                name: 'readOnce',
                type: 'boolean',
                default: false,
            },
            createDurationPropertyOptions({
                displayName: 'Existence duration',
                name: 'existenceDuration',
                description: 'This message will only exist for the specified duration',
                defaultValue: { mode: 'seconds', value: 20 },
            }),
            createDurationPropertyOptions({
                displayName: 'Visibility Duration',
                name: 'visibilityDuration',
                description: 'This message will only be visible for the specified duration',
                defaultValue: { mode: 'seconds', value: 20 },
            }),
            {
                displayName: 'Reply To Message',
                name: 'replyToMessage',
                type: 'collection',
                default: {},
                description: 'If the message is a reply, ID of the original message',
                options: [
                    messageId,
                    messageIdType
                ],
            },
            {
                displayName: 'Disable Link Preview',
                name: 'disableLinkPreview',
                type: 'boolean',
                default: false,
                description: 'Disable link preview for this message',
            }
        ],
    },
];

const displayOptions = {
    show: {
        resource: ['message'],
        operation: ['send'],
    },
};

export const description = updateDisplayOptions(displayOptions, properties);

export async function execute(this: IExecuteFunctions, index: number, client: OlvidClient): Promise<INodeExecutionData[]> {
    const discussionId: bigint = getDiscussionIdRequired.call(this, index);
    if (discussionId === BigInt(0)) {
        return this.helpers.returnJsonArray([{
            "body": "Welcome to Olvid!",
            "id": {
                "type": "TYPE_OUTBOUND",
                "id": 738
            },
            "discussionId": 0,
            "senderId": 0,
            "sortIndex": 1737681102691,
            "timestamp": 1737681130082,
            "attachmentsCount": 0,
            "reactions": [],
        }]);
    }

    const body: string | undefined = this.getNodeParameter('text', index) as string | undefined;

    const additionalFields = this.getNodeParameter('additionalFields', index) as IDataObject;

    let replyId: datatypes.MessageId | undefined = getMessageIdCollection.call(this, additionalFields['replyToMessage'] as IDataObject);
    let readOnce: boolean = additionalFields.readOnce as boolean | undefined ?? false;
    let existenceDuration: bigint | undefined = getDurationInSeconds(additionalFields, 'existenceDuration');
    let visibilityDuration: bigint | undefined = getDurationInSeconds(additionalFields, 'visibilityDuration');

    const ephemerality: datatypes.MessageEphemerality | undefined = new datatypes.MessageEphemerality({
        readOnce,
        existenceDuration,
        visibilityDuration
    });

    const files = this.getNodeParameter(propNames.files, index) as IDataObject | undefined;
    let attachments: { filename: string; payload: Uint8Array; }[] | undefined = undefined;
    if (files !== undefined && files['values'] !== undefined) {
        attachments = [];
        for (const file of files['values'] as IDataObject[]) {
            if (file['isBase64'] === true) {
                attachments.push({
                    filename: file['fileName'] as string,
                    payload: Buffer.from(file['fileData'] as string, 'base64'),
                });
            } else {
                const binaryPropertyName = file['binaryPropertyName'] as string;
                const binaryData = this.helpers.assertBinaryData(index, binaryPropertyName);
                const binaryDataBuffer = await this.helpers.getBinaryDataBuffer(index, binaryPropertyName);
                attachments.push({
                    filename: binaryData.fileName as string,
                    payload: binaryDataBuffer,
                });
            }
        }
    }

    const disableLinkPreview: boolean = additionalFields.disableLinkPreview as boolean | undefined ?? false;

    let messageSent = undefined;
    let attachmentsSent = undefined;
    if (attachments !== undefined) {
        const response = await client.messageSendWithAttachments({ discussionId, body, attachments, replyId, ephemerality, disableLinkPreview });
        messageSent = response.message;
        attachmentsSent = response.attachments;
    } else {
        if (body === undefined || body === '') {
            throw new Error("The 'Text' field can't be empty if no attachments are provided.");
        } else {
            messageSent = await client.messageSend({ discussionId, body, replyId, ephemerality, disableLinkPreview });
        }
    }
    return this.helpers.returnJsonArray({
        message: {
            id: {
                type: datatypes.MessageId_Type[messageSent.id?.type ?? 0],
                id: Number(messageSent?.id?.id)
            },
            discussionId: Number(messageSent?.discussionId),
            senderId: Number(messageSent?.senderId),
            body: messageSent?.body,
            sortIndex: messageSent?.sortIndex,
            timestamp: Number(messageSent?.timestamp),
            attachmentsCount: Number(messageSent?.attachmentsCount),
            repliedMessageId: {
                type: datatypes.MessageId_Type[messageSent?.repliedMessageId?.type ?? 0],
                id: Number(messageSent?.repliedMessageId?.id)
            },
            messageLocation: {
                type: datatypes.MessageLocation_LocationType[messageSent?.messageLocation?.type ?? 0],
                timestamp: Number(messageSent?.messageLocation?.timestamp),
                latitude: messageSent?.messageLocation?.latitude,
                longitude: messageSent?.messageLocation?.longitude,
                altitude: messageSent?.messageLocation?.altitude,
                precision: messageSent?.messageLocation?.precision,
                address: messageSent?.messageLocation?.address
            },
            reactions: messageSent?.reactions.map(e => ({ contactId: Number(e.contactId), reaction: e.reaction, timestamp: Number(e.timestamp) }))
        },
        attachments: attachmentsSent ? attachmentsSent.map((attachment) => ({
            id: attachment.id,
            filename: attachment.fileName,
            mimeType: attachment.mimeType,
            size: attachment.size,
        })) : undefined,
    });
}
