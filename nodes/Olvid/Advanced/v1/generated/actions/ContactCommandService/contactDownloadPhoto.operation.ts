// @generated by protoc-gen-n8n-actions v1 with parameter "target=ts"
// @generated from file olvid/daemon/services/v1/command_service.proto (package olvid.daemon.services.v1, syntax proto3)
/* eslint-disable */

import { type IExecuteFunctions, type INodeExecutionData, type IDataObject, type INodeProperties, updateDisplayOptions } from 'n8n-workflow';

// noinspection ES6UnusedImports
import { datatypes, OlvidClient, commands } from '@olvid/bot-node';

const properties: INodeProperties[] = [
  {
    displayName: 'ContactId',
    name: 'contactId',
    type: 'number',
    required: true,

    default: 0,
  },
];

const displayOptions = {
  show: {
    resource: ['ContactCommandService'],
    operation: ['ContactDownloadPhoto'],
  },
};

export const description = updateDisplayOptions(displayOptions, properties);

export async function execute(this: IExecuteFunctions, index: number, client: OlvidClient): Promise<INodeExecutionData[]> {
    const contactId: bigint = BigInt(this.getNodeParameter('contactId', index) as number);
    const response: commands.ContactDownloadPhotoResponse = await client.stubs.contactCommandStub.contactDownloadPhoto({contactId});
    return this.helpers.returnJsonArray({photo: response?.photo
});
}
