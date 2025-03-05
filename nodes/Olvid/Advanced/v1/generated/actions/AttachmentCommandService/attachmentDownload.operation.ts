// Copied from: overrides/attachmentDownload.operation.ts
import { type IBinaryData, type IExecuteFunctions, type INodeExecutionData, type INodeProperties, updateDisplayOptions } from 'n8n-workflow';

import { datatypes, OlvidClient } from '@olvid/bot-node';
// @ts-ignore
import { formatFileSize } from '../../../../../GenericFunctions';

const properties: INodeProperties[] = [
    {
        displayName: 'AttachmentId - Type',
        name: 'type',
        type: 'options',
        required: true,
        options: [
            { name: 'TYPE_UNSPECIFIED', value: 'TYPE_UNSPECIFIED' },
            { name: 'TYPE_INBOUND', value: 'TYPE_INBOUND' },
            { name: 'TYPE_OUTBOUND', value: 'TYPE_OUTBOUND' },
        ],
        default: 'TYPE_UNSPECIFIED',
    },
    {
        displayName: 'AttachmentId - ID',
        name: 'id',
        type: 'number',
        required: true,
        default: '',
    },
];

const displayOptions = {
    show: {
        resource: ['AttachmentCommandService'],
        operation: ['AttachmentDownload'],
    },
};

export const description = updateDisplayOptions(displayOptions, properties);

export async function execute(this: IExecuteFunctions, index: number, client: OlvidClient): Promise<INodeExecutionData[]> {
    function getAttachmentId(this: IExecuteFunctions, index: number): datatypes.AttachmentId {
        function getType(this: IExecuteFunctions, index: number): datatypes.AttachmentId_Type {
            const value: string | number = this.getNodeParameter('type', index) as string | number
            if (typeof value == 'number') {
                if (datatypes.AttachmentId_Type[value] === undefined) {
                    throw new Error('The attachment type "${value}" is not known.');
                }
                return value as datatypes.AttachmentId_Type;
            }
            else {
                const enumKey = value.replace("TYPE_", "");
                return datatypes.AttachmentId_Type[enumKey as keyof typeof datatypes.AttachmentId_Type];
            }
        }
        const type: datatypes.AttachmentId_Type = getType.call(this, index);
        const id: bigint = BigInt(this.getNodeParameter('id', index) as number);
        return new datatypes.AttachmentId({
            type,
            id,
        });
    }
    const attachmentId: datatypes.AttachmentId = getAttachmentId.call(this, index);
    const attachment: datatypes.Attachment = await client.attachmentGet({ attachmentId });

    const chunks: Uint8Array[] = [];
    let totalLength = 0;
    for await (const chunk of await client.attachmentDownload({ attachmentId })) {
        chunks.push(chunk);
        totalLength += chunk.length;
    }
    const binaryData: IBinaryData = {
        data: Buffer.concat(chunks, totalLength).toString('base64'),
        mimeType: attachment.mimeType,
        fileName: attachment.fileName,
        fileSize: formatFileSize(attachment.size),
        fileExtension: attachment.fileName.split('.').pop() || '',
    };

    return [{
        ...this.helpers.returnJsonArray([{id: {type: datatypes.AttachmentId_Type[attachment?.id?.type ?? 0], id: Number(attachment?.id?.id)}, discussionId: Number(attachment?.discussionId), messageId: {type: datatypes.MessageId_Type[attachment?.messageId?.type ?? 0], id: Number(attachment?.messageId?.id)}, fileName: attachment?.fileName, mimeType: attachment?.mimeType, size: Number(attachment?.size)}])[0], binary: { data: binaryData }
    }];
}

