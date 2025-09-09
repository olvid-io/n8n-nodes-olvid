// import { NodeConnectionType, type INodeTypeDescription } from 'n8n-workflow';
// import { resourceDescriptions, resourceOptionsList } from '../generated/triggers/generatedVersionDescription';
// import { MessageReceived } from '../generated/triggers/MessageNotificationService';
//
// export const versionDescription: INodeTypeDescription = {
// 	displayName: 'OlvidAdvanced Trigger',
// 	name: 'olvidTrigger',
// 	group: ['trigger'],
// 	version: 1,
// 	description: 'Start the workflow on Olvid update',
// 	defaults: {
// 		name: 'OlvidAdvanced Trigger',
// 	},
// 	inputs: [],
// 	outputs: [NodeConnectionType.Main],
// 	credentials: [
// 		{
// 			name: 'olvidApi',
// 			required: true,
// 			testedBy: 'testOlvidDaemon',
// 		},
// 	],
// 	properties: [
// 		// TODO Transfer to new mechanism ?
// 		{
// 			displayName: 'Trigger On',
// 			name: 'updates',
// 			type: 'options',
// 			options: resourceOptionsList,
// 			required: true,
// 			default: '',
// 		},
// 		{
// 			displayName: 'Dry Run for "Test Step" (Use Mock Data) WARNING: WIP',
// 			name: 'mockData',
// 			type: 'boolean',
// 			// isNodeSetting: true,
// 			default: false,
// 			description:
// 				'Use mock data for "Test step" to test the workflow without connecting to Olvid daemon',
// 		},
//
// 		{
// 			displayName: 'Operation',
// 			name: 'operation',
// 			type: 'options',
// 			noDataExpression: true,
// 			displayOptions: {
// 				show: {
// 					resource: ['MessageNotificationService'],
// 				},
// 			},
// 			// eslint-disable-next-line n8n-nodes-base/node-param-options-type-unsorted-items
// 			options: [
// 				{
// 					name: 'MessageReceived',
// 					value: 'MessageReceived',
// 					action: 'Message received',
// 				},
// 			],
// 			default: 'MessageReceived',
// 		},
// 		...MessageReceived.description
// 	]
// };
