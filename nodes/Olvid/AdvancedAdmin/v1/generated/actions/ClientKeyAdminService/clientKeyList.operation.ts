// @generated by protoc-gen-n8n-actions v1 with parameter "target=ts"
// @generated from file olvid/daemon/services/v1/admin_service.proto (package olvid.daemon.services.v1, syntax proto3)
/* eslint-disable */

import { type IExecuteFunctions, type INodeExecutionData, type IDataObject, type INodeProperties, updateDisplayOptions } from 'n8n-workflow';

// noinspection ES6UnusedImports
import { datatypes, OlvidAdminClient, admin } from '@olvid/bot-node';

const properties: INodeProperties[] = [
  {
    displayName: 'Filter',
    name: 'filter',
    type: 'collection',
    default: {
    },
    options: [
      {
        displayName: 'Filter | AdminKey',
        name: 'identitySelect',
        type: 'options',
        options: [
          { name: 'Select', value: 'undefined' },
          { name: 'adminKey', value: 'adminKey' },
          { name: 'identityId', value: 'identityId' },
        ],
        default: 'undefined',
      },
      {
        displayName: 'Filter | AdminKey - AdminKey',
        name: 'adminKey',
        type: 'boolean',


        default: false,
      },
      {
        displayName: 'Filter | AdminKey - IdentityId',
        name: 'identityId',
        type: 'number',


        default: 0,
      },
      {
        displayName: 'Filter | NameSearch',
        name: 'nameSearch',
        type: 'string',


        default: '',
      },
      {
        displayName: 'Filter | Key',
        name: 'key',
        type: 'string',


        default: '',
      },
    ],
  },
];

const displayOptions = {
  show: {
    resource: ['ClientKeyAdminService'],
    operation: ['ClientKeyList'],
  },
};

export const description = updateDisplayOptions(displayOptions, properties);

export async function execute(this: IExecuteFunctions, index: number, client: OlvidAdminClient): Promise<INodeExecutionData[]> {
    function getFilter(this: IExecuteFunctions, index: number): datatypes.ClientKeyFilter | undefined {
        const itemFilter = this.getNodeParameter('filter', index) as IDataObject | undefined;
        if (itemFilter === undefined) {
            return undefined;
        }
        type identityType =
            { value?: undefined, case: undefined } |
            { value: boolean, case: "adminKey" } |
            { value: bigint, case: "identityId" };
        function getIdentity(this: IExecuteFunctions, itemClientKeyFilter: IDataObject): identityType {
            const selectedCase: string | undefined = itemClientKeyFilter['identitySelect'] as string | undefined;
            if (selectedCase === undefined) {
                return { case: undefined };
            }

            if (selectedCase === "adminKey") {
                const adminKey: boolean = itemClientKeyFilter['adminKey'] as boolean;
                return { value: adminKey, case: "adminKey" };
            }
            if (selectedCase === "identityId") {
                const identityId: bigint = BigInt(itemClientKeyFilter['identityId'] as number);
                return { value: identityId, case: "identityId" };
            }
            return { case: undefined };
        }
        const identity: identityType | undefined = getIdentity.call(this, itemFilter);
        const nameSearch: string | undefined = itemFilter['nameSearch'] ? itemFilter['nameSearch'] as string : undefined;
        const key: string | undefined = itemFilter['key'] ? itemFilter['key'] as string : undefined;
        return new datatypes.ClientKeyFilter({
            nameSearch,
            key,
            identity,
        });
    }
    const filter: datatypes.ClientKeyFilter | undefined = getFilter.call(this, index);

    const containerMessage: admin.ClientKeyListResponse = new admin.ClientKeyListResponse();
    for await (const message of client.adminStubs.clientKeyAdminStub.clientKeyList({filter})) {
        containerMessage.clientKeys.push(...message.clientKeys);
    }

    return this.helpers.returnJsonArray(containerMessage?.clientKeys.map(e => ({name: e.name, key: e.key, identityId: Number(e.identityId)}))
);
}
