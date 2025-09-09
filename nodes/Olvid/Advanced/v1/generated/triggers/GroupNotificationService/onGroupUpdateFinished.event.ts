/* eslint-disable n8n-nodes-base/node-param-display-name-miscased-id,n8n-nodes-base/node-param-required-false,n8n-nodes-base/node-param-collection-type-unsorted-items,n8n-nodes-base/node-param-options-type-unsorted-items */
import { OlvidClient } from '../../../../../client/OlvidClient';
// noinspection ES6UnusedImports
import * as datatypes from '../../../../../protobuf/olvid/daemon/datatypes/v1/datatypes';
// noinspection ES6UnusedImports
import * as notifications from '../../../../../protobuf/olvid/daemon/notification/v1/notification';
// noinspection ES6UnusedImports
import { type ITriggerFunctions, type IDataObject, type INodeProperties, updateDisplayOptions, replaceCircularReferences } from 'n8n-workflow';


const properties: INodeProperties[] = [
  {
    displayName: 'Count',
    name: 'count',
    type: 'number',
    required: false,

    default: 0,
  },
  {
    displayName: 'GroupIds - List',
    name: 'groupIdsList',
    type: 'fixedCollection',
    typeOptions: {
      multipleValues: true,
    },
    default: {},
    options: [
      {
        name: 'collection',
        displayName: 'Collection',
        values: [
          {
            displayName: 'GroupIds',
            name: 'groupIds',
            type: 'number',


            default: 0,
          },
        ],
      },
    ],
  },
];

const displayOptions = {
  show: {
    updates: ['GroupUpdateFinished'],
  },
};

export const groupUpdateFinishedProperties = updateDisplayOptions(displayOptions, properties);

export function groupUpdateFinished(this: ITriggerFunctions, client: OlvidClient, onCallback?: Function, returnMockData: boolean = false): Function {
    const count: bigint | undefined = this.getNodeParameter('count') ? BigInt(this.getNodeParameter('count') as number) : undefined;
    function getGroupIds(this: ITriggerFunctions, ): bigint[] {
        const groupIdsCollectionParent: IDataObject | undefined = this.getNodeParameter('groupIdsList') as IDataObject | undefined;
        if (groupIdsCollectionParent === undefined) {
            return [];
        }
        const groupIdsCollection: IDataObject[] | undefined = groupIdsCollectionParent['collection'] as IDataObject[] | undefined;
        if (groupIdsCollection === undefined) {
            return [];
        }
        const groupIdsList: bigint[] = [];
        for (const itemGroupIds of groupIdsCollection) {
            const groupIds: bigint = BigInt(itemGroupIds['groupIds'] as number);
            groupIdsList.push(groupIds);
        }
        return groupIdsList;
    }
    const groupIds: bigint[] = getGroupIds.call(this, );

    if (returnMockData) {
        this.emit([this.helpers.returnJsonArray([{
// groupId.mockData
        }])]);
        onCallback?.();
        return () => {};
    }

	const callback = (notification: notifications.GroupUpdateFinishedNotification) => {
		this.emit([this.helpers.returnJsonArray({groupId: Number(notification?.groupId)
})]);
		onCallback?.();
	}

	return client.stubs.groupNotificationStub.groupUpdateFinished({count, groupIds}, callback, () => {});

}
