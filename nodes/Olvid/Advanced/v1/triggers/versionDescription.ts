import { NodeConnectionType, type INodeTypeDescription } from 'n8n-workflow';
import { generatedDescriptions } from '../generated/triggers/generatedVersionDescription';

export const versionDescription: INodeTypeDescription = {
  displayName: 'OlvidAdvanced Trigger',
  name: 'olvidTrigger',
  group: ['trigger'],
  version: 1,
  description: 'Start the workflow on Olvid update',
  defaults: {
    name: 'OlvidAdvanced Trigger',
  },
  inputs: [],
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
      displayName: 'Trigger On',
      name: 'updates',
      type: 'options',
      options: [
        ...generatedDescriptions,
      ],
      required: true,
      default: "",
    },
    {
      displayName: 'Dry Run for "Test Step" (Use Mock Data) WARNING: WIP',
      name: 'mockData',
      type: 'boolean',
      // isNodeSetting: true,
      default: false,
      description: 'Use mock data for "Test step" to test the workflow without connecting to Olvid daemon',
    }
  ],
};
