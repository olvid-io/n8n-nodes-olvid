// @generated by protoc-gen-n8n-actions v1 with parameter "target=ts"
// @generated from file olvid/daemon/services/v1/command_service.proto (package olvid.daemon.services.v1, syntax proto3)
/* eslint-disable */

import { type IExecuteFunctions, type INodeExecutionData, type IDataObject, type INodeProperties, updateDisplayOptions } from 'n8n-workflow';

// noinspection ES6UnusedImports
import { datatypes, OlvidClient, commands } from '@olvid/bot-node';

const properties: INodeProperties[] = [
];

const displayOptions = {
  show: {
    resource: ['DiscussionCommandService'],
    operation: ['DiscussionLockedList'],
  },
};

export const description = updateDisplayOptions(displayOptions, properties);

export async function execute(this: IExecuteFunctions, index: number, client: OlvidClient): Promise<INodeExecutionData[]> {

    const containerMessage: commands.DiscussionLockedListResponse = new commands.DiscussionLockedListResponse();
    for await (const message of client.stubs.discussionCommandStub.discussionLockedList({})) {
        containerMessage.discussions.push(...message.discussions);
    }

    return this.helpers.returnJsonArray(containerMessage?.discussions.map(e => ({id: Number(e.id), title: e.title, contactId: e.identifier.case === 'contactId' ? Number(e.identifier.value) : undefined, groupId: e.identifier.case === 'groupId' ? Number(e.identifier.value) : undefined}))
);
}
