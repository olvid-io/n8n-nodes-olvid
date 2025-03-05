/* eslint-disable n8n-nodes-base/node-filename-against-convention */
import { NodeConnectionType, type INodeTypeDescription } from 'n8n-workflow';

export const versionDescription: INodeTypeDescription = {
  displayName: 'Olvid Trigger',
  name: 'olvidTrigger',
  group: ['trigger'],
  version: 1,
  description: 'Start the workflow on Olvid update',
  defaults: {
    name: 'Olvid Trigger',
  },
  triggerPanel: {
    header: 'Pull in events from Olvid',
    executionsHelp: {
      inactive:
        "<b>While building your workflow</b>, click the 'listen' button, then send a message, a reaction or an attachment to make an event happen. This will trigger an execution, which will show up in this editor.<br /> <br /><b>Once you're happy with your workflow</b>, <a data-key='activate'>activate</a> it. Then every time an Olvid event is received, the workflow will execute. These executions will show up in the <a data-key='executions'>executions list</a>, but not in the editor.",
      active:
        "<b>While building your workflow</b>, click the 'listen' button, then send a message, a reaction or an attachment to make an event happen. This will trigger an execution, which will show up in this editor.<br /> <br /><b>Your workflow will also execute automatically</b>, since it's activated. Every time an Olvid event is received, this node will trigger an execution. These executions will show up in the <a data-key='executions'>executions list</a>, but not in the editor.",
    },
    activationHint:
      "Prepare yourself to send an Olvid Event",
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
        {
          name: 'Message received', // On message received
          value: 'messageReceived',
          description: 'Triggers on new incoming message of any kind — text, photo, sticker, etc',
        },
        {
          name: 'Reaction added', // On reaction added
          value: 'reactionAdded',
          description: 'Triggers on reaction',
        },
        {
          name: 'Attachment received', // On attachment received
          value: 'attachmentReceived',
          description: 'Triggers on new incoming attachment — photo, video, audio, etc',
        }
      ],
      required: true,
      default: "messageReceived",
    },
    {
      displayName: 'Download Attachments',
      name: 'downloadAttachments',
      type: 'boolean',
      default: true,
      description: 'Download attachments from the message',
      displayOptions: {
        show: {
          updates: ['messageReceived', 'attachmentReceived'],
        },
      },
    },
    {
      displayName: 'Dry-run when [🧪 Test step] button pressed',
      name: 'mockData',
      type: 'boolean',
      isNodeSetting: true,
      default: false,
      description: 'Use mock data for [🧪 Test step] button (located at the top right of the drawer of this modal) to test the workflow without connecting to Olvid daemon',
    },
  ],
};
