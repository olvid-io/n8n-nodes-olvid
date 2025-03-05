import type { INodeProperties } from 'n8n-workflow';
import * as send from './send.operation';

export { send };

export const descriptions: INodeProperties[] = [
  {
    displayName: 'Operation',
    name: 'operation',
    type: 'options',
    noDataExpression: true,
    displayOptions: {
      show: {
        resource: ['message'],
      },
    },
    options: [
      {
        name: 'Send',
        value: 'send',
        description: 'Send a message',
        action: 'Send a message',
      },
    ],
    default: 'send',
  },
  ...send.description,
];
