/* eslint-disable n8n-nodes-base/node-filename-against-convention */
import { NodeConnectionType, type INodeTypeDescription } from 'n8n-workflow';
import * as message_operations from './message';
import * as attachment_operations from './attachment';

export const versionDescription: INodeTypeDescription = {
  displayName: 'Olvid',
  name: 'olvid',
  group: ['output'],
  version: 1,
	subtitle: '={{ $parameter["operation"] + ": " + $parameter["resource"] }}',
  description: 'Sends data to Olvid',
  defaults: {
    name: 'Olvid',
  },
  inputs: [NodeConnectionType.Main],
  outputs: [NodeConnectionType.Main],
  credentials: [
    {
      name: 'olvidApi',
      required: true,
      testedBy: 'testOlvidDaemon',
    },
  ],
  properties: [
    {
      displayName: 'Resource',
      name: 'resource',
      type: 'options',
      noDataExpression: true,
      options: [
        {
          name: 'Message',
          value: 'message',
        },
        {
          name: 'Attachment',
          value: 'attachment',
        },
      ],
      default: 'message',
    },
    ...message_operations.descriptions,
    ...attachment_operations.descriptons
  ],
};
