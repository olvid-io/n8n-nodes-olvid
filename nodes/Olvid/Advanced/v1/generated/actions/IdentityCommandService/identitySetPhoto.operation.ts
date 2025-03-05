// Copied from: overrides/identitySetPhoto.operation.ts
import { type IExecuteFunctions, type INodeExecutionData, type INodeProperties, updateDisplayOptions } from 'n8n-workflow';
import { commands, OlvidClient } from '@olvid/bot-node';

const properties: INodeProperties[] = [
	{
		displayName: 'Binary Property Name',
		name: 'binaryPropertyName',
		type: 'string',
		required: true,
		default: 'data',
	},
];

const displayOptions = {
	show: {
		resource: ['IdentityCommandService'],
		operation: ['IdentitySetPhoto'],
	},
};

export const description = updateDisplayOptions(displayOptions, properties);

const CHUNK_SIZE = 1_000_000;

export async function execute(this: IExecuteFunctions, index: number, client: OlvidClient): Promise<INodeExecutionData[]> {
	const binaryPropertyName: string = this.getNodeParameter('binaryPropertyName', index) as string;
	const binaryData = this.helpers.assertBinaryData(index, binaryPropertyName);
	const payload = await this.helpers.getBinaryDataBuffer(index, binaryPropertyName);

	async function* requestStream(): AsyncIterable<commands.IdentitySetPhotoRequest> {
		// send metadata
		yield new commands.IdentitySetPhotoRequest({
			request: {
				case: "metadata", value: new commands.IdentitySetPhotoRequestMetadata({
					filename: binaryData.fileName,
					fileSize: BigInt(payload.length)
				})
			}
		});

		// send payload
		let chunkNumber = Math.floor(payload.length / CHUNK_SIZE);
		chunkNumber += (payload.length % CHUNK_SIZE) !== 0 ? 1 : 0;
		let chunkIndex = 0;
		while (chunkIndex < chunkNumber) {
			let start = chunkIndex * CHUNK_SIZE;
			let end = (chunkIndex + 1) * CHUNK_SIZE;
			if (end > payload.length) {
				yield new commands.IdentitySetPhotoRequest({ request: { case: "payload", value: payload.subarray(start) } });
			} else {
				yield new commands.IdentitySetPhotoRequest({ request: { case: "payload", value: payload.subarray(start, end) } });
			}
			chunkIndex += 1;
		}
	}

	const reponse: commands.IdentitySetPhotoResponse = await client.stubs.identityCommandStub.identitySetPhoto(requestStream());
	return this.helpers.returnJsonArray([]);
}

