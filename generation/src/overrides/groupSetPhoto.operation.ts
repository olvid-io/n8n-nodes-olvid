import { type IExecuteFunctions, type INodeExecutionData, type INodeProperties, updateDisplayOptions } from 'n8n-workflow';

import { datatypes, commands, OlvidClient } from '@olvid/bot-node';

const properties: INodeProperties[] = [
	{
		displayName: 'GroupId',
		name: 'groupId',
		type: 'number',
		required: true,
		default: 0,
	},
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
		resource: ['GroupCommandService'],
		operation: ['GroupSetPhoto'],
	},
};

export const description = updateDisplayOptions(displayOptions, properties);

const CHUNK_SIZE = 1_000_000;

export async function execute(this: IExecuteFunctions, index: number, client: OlvidClient): Promise<INodeExecutionData[]> {
	const groupId: bigint = BigInt(this.getNodeParameter('groupId', index) as number);
	const binaryPropertyName: string = this.getNodeParameter('binaryPropertyName', index) as string;
	const binaryData = this.helpers.assertBinaryData(index, binaryPropertyName);
	const payload = await this.helpers.getBinaryDataBuffer(index, binaryPropertyName);

	async function* requestStream(): AsyncIterable<commands.GroupSetPhotoRequest> {
		// send metadata
		yield new commands.GroupSetPhotoRequest({
			request: {
				case: "metadata", value: new commands.GroupSetPhotoRequestMetadata({
					groupId: groupId,
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
				yield new commands.GroupSetPhotoRequest({ request: { case: "payload", value: payload.subarray(start) } });
			} else {
				yield new commands.GroupSetPhotoRequest({ request: { case: "payload", value: payload.subarray(start, end) } });
			}
			chunkIndex += 1;
		}
	}
	const response: commands.GroupSetPhotoResponse = await client.stubs.groupCommandStub.groupSetPhoto(requestStream());
    return this.helpers.returnJsonArray({id: Number(response?.group?.id), type: datatypes.Group_Type[response?.group?.type ?? 0], advancedConfiguration: {readOnly: response?.group?.advancedConfiguration?.readOnly, remoteDelete: datatypes.Group_AdvancedConfiguration_RemoteDelete[response?.group?.advancedConfiguration?.remoteDelete ?? 0]}, ownPermissions: {admin: response?.group?.ownPermissions?.admin, remoteDeleteAnything: response?.group?.ownPermissions?.remoteDeleteAnything, editOrRemoteDeleteOwnMessages: response?.group?.ownPermissions?.editOrRemoteDeleteOwnMessages, changeSettings: response?.group?.ownPermissions?.changeSettings, sendMessage: response?.group?.ownPermissions?.sendMessage}, members: response?.group?.members.map(e => ({contactId: Number(e.contactId), permissions: {admin: e.permissions?.admin, remoteDeleteAnything: e.permissions?.remoteDeleteAnything, editOrRemoteDeleteOwnMessages: e.permissions?.editOrRemoteDeleteOwnMessages, changeSettings: e.permissions?.changeSettings, sendMessage: e.permissions?.sendMessage}})), pendingMembers: response?.group?.pendingMembers.map(e => ({pendingMemberId: Number(e.pendingMemberId), contactId: Number(e.contactId), displayName: e.displayName, declined: e.declined, permissions: {admin: e.permissions?.admin, remoteDeleteAnything: e.permissions?.remoteDeleteAnything, editOrRemoteDeleteOwnMessages: e.permissions?.editOrRemoteDeleteOwnMessages, changeSettings: e.permissions?.changeSettings, sendMessage: e.permissions?.sendMessage}})), updateInProgress: response?.group?.updateInProgress, keycloakManaged: response?.group?.keycloakManaged, name: response?.group?.name, description: response?.group?.description, hasAPhoto: response?.group?.hasAPhoto});
}
