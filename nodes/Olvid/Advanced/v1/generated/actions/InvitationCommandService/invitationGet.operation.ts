// @generated by protoc-gen-n8n-actions v1 with parameter "target=ts"
// @generated from file olvid/daemon/services/v1/command_service.proto (package olvid.daemon.services.v1, syntax proto3)
/* eslint-disable */

import { type IExecuteFunctions, type INodeExecutionData, type IDataObject, type INodeProperties, updateDisplayOptions } from 'n8n-workflow';

// noinspection ES6UnusedImports
import { datatypes, OlvidClient, commands } from '@olvid/bot-node';

const properties: INodeProperties[] = [
  {
    displayName: 'InvitationId',
    name: 'invitationId',
    type: 'number',
    required: true,

    default: 0,
  },
];

const displayOptions = {
  show: {
    resource: ['InvitationCommandService'],
    operation: ['InvitationGet'],
  },
};

export const description = updateDisplayOptions(displayOptions, properties);

export async function execute(this: IExecuteFunctions, index: number, client: OlvidClient): Promise<INodeExecutionData[]> {
    const invitationId: bigint = BigInt(this.getNodeParameter('invitationId', index) as number);
    const response: commands.InvitationGetResponse = await client.stubs.invitationCommandStub.invitationGet({invitationId});
    return this.helpers.returnJsonArray({id: Number(response?.invitation?.id), status: datatypes.Invitation_Status[response?.invitation?.status ?? 0], displayName: response?.invitation?.displayName, timestamp: Number(response?.invitation?.timestamp), sas: response?.invitation?.sas});
}
