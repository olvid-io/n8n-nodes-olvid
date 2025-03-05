// @generated by protoc-gen-n8n-actions v1 with parameter "target=ts"
// @generated from file olvid/daemon/services/v1/command_service.proto (package olvid.daemon.services.v1, syntax proto3)
/* eslint-disable */

import { type IExecuteFunctions, type INodeExecutionData, type IDataObject, type INodeProperties, updateDisplayOptions } from 'n8n-workflow';

// noinspection ES6UnusedImports
import { datatypes, OlvidClient, commands } from '@olvid/bot-node';

const properties: INodeProperties[] = [
  {
    displayName: 'GroupId',
    name: 'groupId',
    type: 'number',
    required: true,

    default: 0,
  },
];

const displayOptions = {
  show: {
    resource: ['DiscussionCommandService'],
    operation: ['DiscussionGetByGroup'],
  },
};

export const description = updateDisplayOptions(displayOptions, properties);

export async function execute(this: IExecuteFunctions, index: number, client: OlvidClient): Promise<INodeExecutionData[]> {
    const groupId: bigint = BigInt(this.getNodeParameter('groupId', index) as number);
    const response: commands.DiscussionGetByGroupResponse = await client.stubs.discussionCommandStub.discussionGetByGroup({groupId});
    return this.helpers.returnJsonArray({id: Number(response?.discussion?.id), title: response?.discussion?.title, contactId: response?.discussion?.identifier.case === 'contactId' ? Number(response?.discussion?.identifier.value) : undefined, groupId: response?.discussion?.identifier.case === 'groupId' ? Number(response?.discussion?.identifier.value) : undefined});
}
