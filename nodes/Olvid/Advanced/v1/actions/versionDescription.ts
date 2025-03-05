import { NodeConnectionType, type INodeTypeDescription } from 'n8n-workflow';
import { resourceDescriptions, resourceOptionsList } from '../generated/actions/generatedVersionDescription';

export const versionDescription: INodeTypeDescription = {
  displayName: 'OlvidAdvanced',
  name: 'olvidAdvanced',
  group: ['output'],
  version: 1,
  description: 'Sends data to OlvidAdvanced',
  defaults: {
    name: 'OlvidAdvanced',
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
      options: resourceOptionsList,
      default: 'message',
    },
    ...resourceDescriptions,
  ],
};

