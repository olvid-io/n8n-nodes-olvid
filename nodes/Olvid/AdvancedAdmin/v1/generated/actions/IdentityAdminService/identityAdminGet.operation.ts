// @generated by protoc-gen-n8n-actions v1 with parameter "target=ts"
// @generated from file olvid/daemon/services/v1/admin_service.proto (package olvid.daemon.services.v1, syntax proto3)
/* eslint-disable */

import { type IExecuteFunctions, type INodeExecutionData, type IDataObject, type INodeProperties, updateDisplayOptions } from 'n8n-workflow';

// noinspection ES6UnusedImports
import { datatypes, OlvidAdminClient, admin } from '@olvid/bot-node';

const properties: INodeProperties[] = [
  {
    displayName: 'IdentityId',
    name: 'identityId',
    type: 'number',
    required: true,

    default: 0,
  },
];

const displayOptions = {
  show: {
    resource: ['IdentityAdminService'],
    operation: ['IdentityAdminGet'],
  },
};

export const description = updateDisplayOptions(displayOptions, properties);

export async function execute(this: IExecuteFunctions, index: number, client: OlvidAdminClient): Promise<INodeExecutionData[]> {
    const identityId: bigint = BigInt(this.getNodeParameter('identityId', index) as number);
    const response: admin.IdentityAdminGetResponse = await client.adminStubs.identityAdminStub.identityAdminGet({identityId});
    return this.helpers.returnJsonArray({id: Number(response?.identity?.id), displayName: response?.identity?.displayName, details: {firstName: response?.identity?.details?.firstName, lastName: response?.identity?.details?.lastName, company: response?.identity?.details?.company, position: response?.identity?.details?.position}, invitationUrl: response?.identity?.invitationUrl, keycloakManaged: response?.identity?.keycloakManaged, hasAPhoto: response?.identity?.hasAPhoto, apiKey: {permission: {call: response?.identity?.apiKey?.permission?.call, multiDevice: response?.identity?.apiKey?.permission?.multiDevice}, expirationTimestamp: Number(response?.identity?.apiKey?.expirationTimestamp)}});
}
