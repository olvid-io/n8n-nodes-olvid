// @generated by protoc-gen-n8n-actions v1 with parameter "target=ts"
// @generated from file olvid/daemon/services/v1/command_service.proto (package olvid.daemon.services.v1, syntax proto3)
/* eslint-disable */

import { type IExecuteFunctions, type INodeExecutionData, type IDataObject, type INodeProperties, updateDisplayOptions } from 'n8n-workflow';

// noinspection ES6UnusedImports
import { datatypes, OlvidClient, commands } from '@olvid/bot-node';

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
        displayName: 'MessageId | Id',
        name: 'id',
        type: 'number',


        default: 0,
      },
    ],
  },
  {
    displayName: 'UpdatedBody',
    name: 'updatedBody',
    type: 'string',
    required: true,

    default: '',
  },
];

const displayOptions = {
  show: {
    resource: ['MessageCommandService'],
    operation: ['MessageUpdateBody'],
  },
};

export const description = updateDisplayOptions(displayOptions, properties);

export async function execute(this: IExecuteFunctions, index: number, client: OlvidClient): Promise<INodeExecutionData[]> {
    function getMessageId(this: IExecuteFunctions, index: number): datatypes.MessageId {
        const itemMessageId = this.getNodeParameter('messageId', index) as IDataObject;
        function getType(this: IExecuteFunctions, itemMessageId: IDataObject): datatypes.MessageId_Type {
            const value: string | number = itemMessageId['type'] as string | number;

            if (typeof value == 'number') {
                if (datatypes.MessageId_Type [value] === undefined) {
                    throw new Error('The attachment type "${value}" is not known.');
                }
                return value as datatypes.MessageId_Type;
            }
            else {
                const enumKey = value.replace("TYPE_", "");
                return datatypes.MessageId_Type [enumKey as keyof typeof datatypes.MessageId_Type];
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
    const updatedBody: string = this.getNodeParameter('updatedBody', index) as string;
    const response: commands.MessageUpdateBodyResponse = await client.stubs.messageCommandStub.messageUpdateBody({messageId, updatedBody});
    return this.helpers.returnJsonArray({});
}
