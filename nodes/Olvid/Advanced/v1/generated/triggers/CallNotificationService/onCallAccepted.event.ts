/* eslint-disable n8n-nodes-base/node-param-display-name-miscased-id,n8n-nodes-base/node-param-required-false,n8n-nodes-base/node-param-collection-type-unsorted-items,n8n-nodes-base/node-param-options-type-unsorted-items */
import { OlvidClient } from '../../../../../client/OlvidClient';
// noinspection ES6UnusedImports
import * as datatypes from '../../../../../protobuf/olvid/daemon/datatypes/v1/datatypes';
// noinspection ES6UnusedImports
import * as notifications from '../../../../../protobuf/olvid/daemon/notification/v1/notification';
// noinspection ES6UnusedImports
import { type ITriggerFunctions, type IDataObject, type INodeProperties, updateDisplayOptions, replaceCircularReferences } from 'n8n-workflow';
// noinspection ES6UnusedImports
import { create } from '@bufbuild/protobuf';


const properties: INodeProperties[] = [
  {
    displayName: 'Count',
    name: 'count',
    type: 'number',
    required: false,

    default: 0,
  },
];

const displayOptions = {
  show: {
    updates: ['CallAccepted'],
  },
};

export const callAcceptedProperties = updateDisplayOptions(displayOptions, properties);

export function callAccepted(this: ITriggerFunctions, client: OlvidClient, onCallback?: Function, returnMockData: boolean = false): Function {
    const count: bigint | undefined = this.getNodeParameter('count') ? BigInt(this.getNodeParameter('count') as number) : undefined;

    if (returnMockData) {
        this.emit([this.helpers.returnJsonArray([{
// callIdentifier.mockData,
// participantId.mockData
        }])]);
        onCallback?.();
        return () => {};
    }

	const callback = (notification: notifications.CallAcceptedNotification) => {
		this.emit([this.helpers.returnJsonArray([{callIdentifier: notification?.callIdentifier
},{participantId: {contactId: notification?.participantId?.id.case === 'contactId' ? Number(notification?.participantId?.id.value) : undefined, participantId: notification?.participantId?.id.case === 'participantId' ? notification?.participantId?.id.value : undefined}}])]);
		onCallback?.();
	}

	return client.stubs.callNotificationStub.callAccepted({count}, callback, () => {});

}
