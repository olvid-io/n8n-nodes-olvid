import { NodeConnectionType, type INodeTypeDescription } from 'n8n-workflow';
import { resourceDescriptions, resourceOptionsList } from '../generated/actions/generatedVersionDescription';

export const versionDescription: INodeTypeDescription = {
  displayName: 'OlvidAdvancedAdmin',
  name: 'olvidAdvancedAdmin',
  group: ['output'],
  version: 1,
  description: 'Sends data to OlvidAdvancedAdmin',
  defaults: {
    name: 'OlvidAdvancedAdmin',
  },
  inputs: [NodeConnectionType.Main],
  outputs: [NodeConnectionType.Main],
  credentials: [
    {
      name: 'olvidAdminApi',
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

