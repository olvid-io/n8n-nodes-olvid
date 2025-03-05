import { type IExecuteFunctions, type INodeExecutionData, type IDataObject, type INodeProperties, updateDisplayOptions } from 'n8n-workflow';

import { datatypes, OlvidClient } from '@olvid/bot-node';

const properties: INodeProperties[] = [
    // Generated code taken from MessageSend.operation.ts 31/01/2025
    {
        displayName: 'DiscussionId',
        name: 'discussionId',
        type: 'number',
        required: true,
        default: 0,
    },
    {
        displayName: 'Body',
        name: 'body',
        type: 'string',
        required: false,
        default: '',
    },
    {
        displayName: 'ReplyId',
        name: 'replyId',
        type: 'collection',
        default: {
        },
        options: [
            {
                displayName: 'ReplyId | Type',
                name: 'type',
                type: 'options',
                options: [
                    { name: 'TYPE_UNSPECIFIED', value: 'TYPE_UNSPECIFIED' },
                    { name: 'TYPE_INBOUND', value: 'TYPE_INBOUND' },
                    { name: 'TYPE_OUTBOUND', value: 'TYPE_OUTBOUND' },
                ],
                default: 'TYPE_UNSPECIFIED',
            },
            {
                displayName: 'ReplyId | ID',
                name: 'id',
                type: 'number',
                default: 0,
            },
        ],
    },
    {
        displayName: 'Ephemerality',
        name: 'ephemerality',
        type: 'collection',
        default: {
        },
        options: [
            {
                displayName: 'Ephemerality | ReadOnce',
                name: 'readOnce',
                type: 'boolean',
                default: false,
            },
            {
                displayName: 'Ephemerality | ExistenceDuration',
                name: 'existenceDuration',
                type: 'number',
                default: 0,
            },
            {
                displayName: 'Ephemerality | VisibilityDuration',
                name: 'visibilityDuration',
                type: 'number',
                default: 0,
            },
        ],
    },
    // End of generated code
    {
        displayName: 'Files',
        name: 'files',
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
                        displayName: 'Use base64 data',
                        name: 'isBase64',
                        type: 'boolean',
                        default: false,
                        description: 'If the file data is base64 encoded',
                    },
                    {
                        displayName: 'File name',
                        name: 'fileName',
                        type: 'string',
                        default: 'file.txt',
                        description: 'The name of the file being sent with the message',
                        placeholder: 'e.g. file.txt',
                        hint: 'The name of the file being sent with the message',
                        displayOptions: { show: { isBase64: [true] } },
                    },
                    {
                        displayName: 'File data',
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
    {
        displayName: 'DisableLinkPreview',
        name: 'disableLinkPreview',
        type: 'boolean',
        default: false,
    },
];

const displayOptions = {
    show: {
        resource: ['MessageCommandService'],
        operation: ['MessageSendWithAttachments'],
    },
};

export const description = updateDisplayOptions(displayOptions, properties);

export async function execute(this: IExecuteFunctions, index: number, client: OlvidClient): Promise<INodeExecutionData[]> {
    // Generated code taken from MessageSend.operation.ts 31/01/2025
    const discussionId: bigint = BigInt(this.getNodeParameter('discussionId', index) as number);
    const body: string | undefined = this.getNodeParameter('body', index) as string | undefined;
    function getMessageId(this: IExecuteFunctions, index: number): datatypes.MessageId | undefined {
        const itemMessageId = this.getNodeParameter('replyId', index) as IDataObject | undefined;
        if (itemMessageId === undefined) {
            return undefined;
        }
        function getType(this: IExecuteFunctions, itemMessageId: IDataObject): datatypes.MessageId_Type | undefined {
            const value: string | number | undefined = itemMessageId['type'] as string | number | undefined;
            if (value === undefined) {
                return undefined;
            }
            if (typeof value == 'number') {
                if (datatypes.MessageId_Type[value] === undefined) {
                    throw new Error('The attachment type "${value}" is not known.');
                }
                return value as datatypes.MessageId_Type;
            }
            else {
                const enumKey = value.replace("TYPE_", "");
                return datatypes.MessageId_Type[enumKey as keyof typeof datatypes.MessageId_Type];
            }
        }
        const type: datatypes.MessageId_Type | undefined = getType.call(this, itemMessageId);
        const id: bigint | undefined = itemMessageId['id'] ? BigInt(itemMessageId['id'] as number) : undefined;
        return new datatypes.MessageId({
            type,
            id,
        });
    }
    const replyId: datatypes.MessageId | undefined = getMessageId.call(this, index);
    function getMessageEphemerality(this: IExecuteFunctions, index: number): datatypes.MessageEphemerality | undefined {
        const itemMessageEphemerality = this.getNodeParameter('ephemerality', index) as IDataObject | undefined;
        if (itemMessageEphemerality === undefined) {
            return undefined;
        }
        const readOnce: boolean | undefined = itemMessageEphemerality['readOnce'] ? itemMessageEphemerality['readOnce'] as boolean : undefined;
        const existenceDuration: bigint | undefined = itemMessageEphemerality['existenceDuration'] ? BigInt(itemMessageEphemerality['existenceDuration'] as number) : undefined;
        const visibilityDuration: bigint | undefined = itemMessageEphemerality['visibilityDuration'] ? BigInt(itemMessageEphemerality['visibilityDuration'] as number) : undefined;
        return new datatypes.MessageEphemerality({
            readOnce,
            existenceDuration,
            visibilityDuration,
        });
    }
    const ephemerality: datatypes.MessageEphemerality | undefined = getMessageEphemerality.call(this, index);
    // End of generated code

    const files = this.getNodeParameter('files', index) as IDataObject;
    let attachments: { filename: string; payload: Uint8Array; }[] = [];
    if (files !== undefined && files['values'] !== undefined) {
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
    } else {
        throw new Error('Please provide at least one file to send');
    }
    const disableLinkPreview: boolean | undefined = this.getNodeParameter('disableLinkPreview', index) as boolean | undefined;

    const response = await client.messageSendWithAttachments({
        discussionId,
        attachments,
        body,
        replyId,
        ephemerality,
        disableLinkPreview
    });
    return this.helpers.returnJsonArray([{ message: { id: { type: datatypes.MessageId_Type[response?.message?.id?.type ?? 0], id: Number(response?.message?.id?.id) }, discussionId: Number(response?.message?.discussionId), senderId: Number(response?.message?.senderId), body: response?.message?.body, sortIndex: response?.message?.sortIndex, timestamp: Number(response?.message?.timestamp), attachmentsCount: Number(response?.message?.attachmentsCount), repliedMessageId: { type: datatypes.MessageId_Type[response?.message?.repliedMessageId?.type ?? 0], id: Number(response?.message?.repliedMessageId?.id) }, messageLocation: { type: datatypes.MessageLocation_LocationType[response?.message?.messageLocation?.type ?? 0], timestamp: Number(response?.message?.messageLocation?.timestamp), latitude: response?.message?.messageLocation?.latitude, longitude: response?.message?.messageLocation?.longitude, altitude: response?.message?.messageLocation?.altitude, precision: response?.message?.messageLocation?.precision, address: response?.message?.messageLocation?.address }, reactions: response?.message?.reactions.map(e => ({ contactId: Number(e.contactId), reaction: e.reaction, timestamp: Number(e.timestamp) })), forwarded: response?.message?.forwarded, editedBody: response?.message?.editedBody } }, {
        attachments: response?.attachments.map(e => ({ id: { type: datatypes.AttachmentId_Type[e.id?.type ?? 0], id: Number(e.id?.id) }, discussionId: Number(e.discussionId), messageId: { type: datatypes.MessageId_Type[e.messageId?.type ?? 0], id: Number(e.messageId?.id) }, fileName: e.fileName, mimeType: e.mimeType, size: Number(e.size) }))
    }]);
}
