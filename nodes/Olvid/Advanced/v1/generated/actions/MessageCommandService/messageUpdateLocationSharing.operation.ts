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
    displayName: 'Latitude',
    name: 'latitude',
    type: 'number',
    required: true,

    default: 0,
  },
  {
    displayName: 'Longitude',
    name: 'longitude',
    type: 'number',
    required: true,

    default: 0,
  },
  {
    displayName: 'Altitude',
    name: 'altitude',
    type: 'number',
    required: false,

    default: 0,
  },
  {
    displayName: 'Precision',
    name: 'precision',
    type: 'number',
    required: false,

    default: 0,
  },
];

const displayOptions = {
  show: {
    resource: ['MessageCommandService'],
    operation: ['MessageUpdateLocationSharing'],
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
    const latitude: number = this.getNodeParameter('latitude', index) as number;
    const longitude: number = this.getNodeParameter('longitude', index) as number;
    const altitude: number | undefined = this.getNodeParameter('altitude', index) ? this.getNodeParameter('altitude', index) as number : undefined;
    const precision: number | undefined = this.getNodeParameter('precision', index) ? this.getNodeParameter('precision', index) as number : undefined;
    const response: commands.MessageUpdateLocationSharingResponse = await client.stubs.messageCommandStub.messageUpdateLocationSharing({messageId, latitude, longitude, altitude, precision});
    return this.helpers.returnJsonArray({id: {type: datatypes.MessageId_Type[response?.message?.id?.type ?? 0], id: Number(response?.message?.id?.id)}, discussionId: Number(response?.message?.discussionId), senderId: Number(response?.message?.senderId), body: response?.message?.body, sortIndex: response?.message?.sortIndex, timestamp: Number(response?.message?.timestamp), attachmentsCount: Number(response?.message?.attachmentsCount), repliedMessageId: {type: datatypes.MessageId_Type[response?.message?.repliedMessageId?.type ?? 0], id: Number(response?.message?.repliedMessageId?.id)}, messageLocation: {type: datatypes.MessageLocation_LocationType[response?.message?.messageLocation?.type ?? 0], timestamp: Number(response?.message?.messageLocation?.timestamp), latitude: response?.message?.messageLocation?.latitude, longitude: response?.message?.messageLocation?.longitude, altitude: response?.message?.messageLocation?.altitude, precision: response?.message?.messageLocation?.precision, address: response?.message?.messageLocation?.address}, reactions: response?.message?.reactions.map(e => ({contactId: Number(e.contactId), reaction: e.reaction, timestamp: Number(e.timestamp)})), forwarded: response?.message?.forwarded, editedBody: response?.message?.editedBody});
}
