// @generated by protoc-gen-n8n-actions v1 with parameter "target=ts"
// @generated from file olvid/daemon/services/v1/command_service.proto (package olvid.daemon.services.v1, syntax proto3)
/* eslint-disable */

import { type IExecuteFunctions, type INodeExecutionData, type IDataObject, type INodeProperties, updateDisplayOptions } from 'n8n-workflow';

// noinspection ES6UnusedImports
import { datatypes, OlvidClient, commands } from '@olvid/bot-node';

const properties: INodeProperties[] = [
  {
    displayName: 'Settings',
    name: 'settings',
    type: 'collection',
    default: {
      discussionId: 0,
      readOnce: false,
      existenceDuration: 0,
      visibilityDuration: 0,
    },
    options: [
      {
        displayName: 'Settings | DiscussionId',
        name: 'discussionId',
        type: 'number',


        default: 0,
      },
      {
        displayName: 'Settings | ReadOnce',
        name: 'readOnce',
        type: 'boolean',


        default: false,
      },
      {
        displayName: 'Settings | ExistenceDuration',
        name: 'existenceDuration',
        type: 'number',


        default: 0,
      },
      {
        displayName: 'Settings | VisibilityDuration',
        name: 'visibilityDuration',
        type: 'number',


        default: 0,
      },
    ],
  },
];

const displayOptions = {
  show: {
    resource: ['DiscussionCommandService'],
    operation: ['DiscussionSettingsSet'],
  },
};

export const description = updateDisplayOptions(displayOptions, properties);

export async function execute(this: IExecuteFunctions, index: number, client: OlvidClient): Promise<INodeExecutionData[]> {
    function getSettings(this: IExecuteFunctions, index: number): datatypes.DiscussionSettings {
        const itemSettings = this.getNodeParameter('settings', index) as IDataObject;
        const discussionId: bigint = BigInt(itemSettings['discussionId'] as number);
        const readOnce: boolean = itemSettings['readOnce'] as boolean;
        const existenceDuration: bigint = BigInt(itemSettings['existenceDuration'] as number);
        const visibilityDuration: bigint = BigInt(itemSettings['visibilityDuration'] as number);
        return new datatypes.DiscussionSettings({
            discussionId,
            readOnce,
            existenceDuration,
            visibilityDuration,
        });
    }
    const settings: datatypes.DiscussionSettings = getSettings.call(this, index);
    const response: commands.DiscussionSettingsSetResponse = await client.stubs.discussionCommandStub.discussionSettingsSet({settings});
    return this.helpers.returnJsonArray({discussionId: Number(response?.newSettings?.discussionId), readOnce: response?.newSettings?.readOnce, existenceDuration: Number(response?.newSettings?.existenceDuration), visibilityDuration: Number(response?.newSettings?.visibilityDuration)});
}
