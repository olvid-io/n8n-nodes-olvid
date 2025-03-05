// @generated by protoc-gen-n8n-actions v1 with parameter "target=ts"
// @generated from file olvid/daemon/services/v1/command_service.proto (package olvid.daemon.services.v1, syntax proto3)
/* eslint-disable */

import { type IExecuteFunctions, type INodeExecutionData, type IDataObject, type INodeProperties, updateDisplayOptions } from 'n8n-workflow';

// noinspection ES6UnusedImports
import { datatypes, OlvidClient, commands } from '@olvid/bot-node';

const properties: INodeProperties[] = [
  {
    displayName: 'NewDetails',
    name: 'newDetails',
    type: 'collection',
    default: {
    },
    options: [
      {
        displayName: 'NewDetails | FirstName',
        name: 'firstName',
        type: 'string',


        default: '',
      },
      {
        displayName: 'NewDetails | LastName',
        name: 'lastName',
        type: 'string',


        default: '',
      },
      {
        displayName: 'NewDetails | Company',
        name: 'company',
        type: 'string',


        default: '',
      },
      {
        displayName: 'NewDetails | Position',
        name: 'position',
        type: 'string',


        default: '',
      },
    ],
  },
];

const displayOptions = {
  show: {
    resource: ['IdentityCommandService'],
    operation: ['IdentityUpdateDetails'],
  },
};

export const description = updateDisplayOptions(displayOptions, properties);

export async function execute(this: IExecuteFunctions, index: number, client: OlvidClient): Promise<INodeExecutionData[]> {
    function getNewDetails(this: IExecuteFunctions, index: number): datatypes.IdentityDetails {
        const itemNewDetails = this.getNodeParameter('newDetails', index) as IDataObject;
        const firstName: string | undefined = itemNewDetails['firstName'] ? itemNewDetails['firstName'] as string : undefined;
        const lastName: string | undefined = itemNewDetails['lastName'] ? itemNewDetails['lastName'] as string : undefined;
        const company: string | undefined = itemNewDetails['company'] ? itemNewDetails['company'] as string : undefined;
        const position: string | undefined = itemNewDetails['position'] ? itemNewDetails['position'] as string : undefined;
        return new datatypes.IdentityDetails({
            firstName,
            lastName,
            company,
            position,
        });
    }
    const newDetails: datatypes.IdentityDetails = getNewDetails.call(this, index);
    const response: commands.IdentityUpdateDetailsResponse = await client.stubs.identityCommandStub.identityUpdateDetails({newDetails});
    return this.helpers.returnJsonArray({});
}
