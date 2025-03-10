// @generated by protoc-gen-n8n-actions v1 with parameter "target=ts"
// @generated from file olvid/daemon/services/v1/command_service.proto (package olvid.daemon.services.v1, syntax proto3)
/* eslint-disable */

import { type IExecuteFunctions, type INodeExecutionData, type IDataObject, type INodeProperties, updateDisplayOptions } from 'n8n-workflow';

// noinspection ES6UnusedImports
import { datatypes, OlvidClient, commands } from '@olvid/bot-node';

const properties: INodeProperties[] = [
  {
    displayName: 'Filter',
    name: 'filter',
    type: 'collection',
    default: {
    },
    options: [
      {
        displayName: 'Filter | KeySearch',
        name: 'keySearch',
        type: 'string',


        default: '',
      },
      {
        displayName: 'Filter | ValueSearch',
        name: 'valueSearch',
        type: 'string',


        default: '',
      },
    ],
  },
];

const displayOptions = {
  show: {
    resource: ['StorageCommandService'],
    operation: ['StorageList'],
  },
};

export const description = updateDisplayOptions(displayOptions, properties);

export async function execute(this: IExecuteFunctions, index: number, client: OlvidClient): Promise<INodeExecutionData[]> {
    function getFilter(this: IExecuteFunctions, index: number): datatypes.StorageElementFilter | undefined {
        const itemFilter = this.getNodeParameter('filter', index) as IDataObject | undefined;
        if (itemFilter === undefined) {
            return undefined;
        }
        const keySearch: string | undefined = itemFilter['keySearch'] ? itemFilter['keySearch'] as string : undefined;
        const valueSearch: string | undefined = itemFilter['valueSearch'] ? itemFilter['valueSearch'] as string : undefined;
        return new datatypes.StorageElementFilter({
            keySearch,
            valueSearch,
        });
    }
    const filter: datatypes.StorageElementFilter | undefined = getFilter.call(this, index);

    const containerMessage: commands.StorageListResponse = new commands.StorageListResponse();
    for await (const message of client.stubs.storageCommandStub.storageList({filter})) {
        containerMessage.elements.push(...message.elements);
    }

    return this.helpers.returnJsonArray(containerMessage?.elements.map(e => ({key: e.key, value: e.value}))
);
}
