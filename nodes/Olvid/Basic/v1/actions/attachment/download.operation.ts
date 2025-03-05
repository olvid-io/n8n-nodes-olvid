import {
	type IExecuteFunctions,
	type IDataObject,
	type INodeExecutionData,
	type IBinaryData,
	updateDisplayOptions,
	INodeProperties
} from 'n8n-workflow';
import { datatypes, OlvidClient } from "@olvid/bot-node";

const properties: INodeProperties[] = [
	{
		displayName: 'MessageId',
		name: 'messageId',
		type: 'collection',
		default: {
			type: 'TYPE_UNSPECIFIED',
			id: 0,
		},
		options: [
			{
				displayName: 'MessageId | Type',
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
				displayName: 'MessageId|ID',
				name: 'id',
				type: 'number',
				default: 0,
			},
		],
	},
];

const displayOptions = {
	show: {
		resource: ['attachment'],
		operation: ['download'],
	},
};

export const description: INodeProperties[] = updateDisplayOptions(displayOptions, properties);

export async function execute(this: IExecuteFunctions, index: number, client: OlvidClient): Promise<INodeExecutionData[]> {
	// get message id parameter
	function getMessageId(this: IExecuteFunctions, index: number): datatypes.MessageId {
		const itemMessageId = this.getNodeParameter('messageId', index) as IDataObject;
		function getType(this: IExecuteFunctions, itemMessageId: IDataObject): datatypes.MessageId_Type {
			const value: string | number = itemMessageId['type'] as string | number;

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
		const type: datatypes.MessageId_Type = getType.call(this, itemMessageId);
		const id: bigint = BigInt(itemMessageId['id'] as number);
		return new datatypes.MessageId({
			type,
			id,
		});
	}
	const messageId: datatypes.MessageId = getMessageId.call(this, index);

	// list message attachments
	const returnData: INodeExecutionData[] = [];
	for await (const attachment of client.attachmentList({ filter: new datatypes.AttachmentFilter({ messageId: messageId }) })) {
		// download attachment content
		const buffer: Buffer = Buffer.alloc(Number(attachment.size));
		let receivedBytes: number = 0;
		for await (const chunk of await client.attachmentDownload({ attachmentId: attachment.id! })) {
			buffer.fill(chunk, receivedBytes);
			receivedBytes += chunk.length;
		}
		// add attachment to returned data
		const binaryData: IBinaryData = await this.helpers.prepareBinaryData(buffer, attachment.mimeType);
		binaryData.fileName = attachment.fileName;
		binaryData.fileExtension = attachment.fileName.split(".").pop();
		binaryData.mimeType = attachment.mimeType;
		returnData.push({
			json: { "attachment": attachment } as any, binary: {
				data: binaryData
			}
		})
	}
	return returnData;
}
