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
    displayName: 'Filter',
    name: 'filter',
    type: 'collection',
    default: {
    },
    options: [
      {
        displayName: 'Filter | Status',
        name: 'status',
        type: 'options',

        options: [
          { name: 'STATUS_UNSPECIFIED', value: 'STATUS_UNSPECIFIED' },
          { name: 'STATUS_INVITATION_WAIT_YOU_TO_ACCEPT', value: 'STATUS_INVITATION_WAIT_YOU_TO_ACCEPT' },
          { name: 'STATUS_INVITATION_WAIT_IT_TO_ACCEPT', value: 'STATUS_INVITATION_WAIT_IT_TO_ACCEPT' },
          { name: 'STATUS_INVITATION_STATUS_IN_PROGRESS', value: 'STATUS_INVITATION_STATUS_IN_PROGRESS' },
          { name: 'STATUS_INVITATION_WAIT_YOU_FOR_SAS_EXCHANGE', value: 'STATUS_INVITATION_WAIT_YOU_FOR_SAS_EXCHANGE' },
          { name: 'STATUS_INVITATION_WAIT_IT_FOR_SAS_EXCHANGE', value: 'STATUS_INVITATION_WAIT_IT_FOR_SAS_EXCHANGE' },
          { name: 'STATUS_INTRODUCTION_WAIT_IT_TO_ACCEPT', value: 'STATUS_INTRODUCTION_WAIT_IT_TO_ACCEPT' },
          { name: 'STATUS_INTRODUCTION_WAIT_YOU_TO_ACCEPT', value: 'STATUS_INTRODUCTION_WAIT_YOU_TO_ACCEPT' },
          { name: 'STATUS_ONE_TO_ONE_INVITATION_WAIT_IT_TO_ACCEPT', value: 'STATUS_ONE_TO_ONE_INVITATION_WAIT_IT_TO_ACCEPT' },
          { name: 'STATUS_ONE_TO_ONE_INVITATION_WAIT_YOU_TO_ACCEPT', value: 'STATUS_ONE_TO_ONE_INVITATION_WAIT_YOU_TO_ACCEPT' },
          { name: 'STATUS_GROUP_INVITATION_WAIT_YOU_TO_ACCEPT', value: 'STATUS_GROUP_INVITATION_WAIT_YOU_TO_ACCEPT' },
          { name: 'STATUS_GROUP_INVITATION_FROZEN', value: 'STATUS_GROUP_INVITATION_FROZEN' },
        ],
        default: 'STATUS_UNSPECIFIED',
      },
      {
        displayName: 'Filter | Type',
        name: 'type',
        type: 'options',

        options: [
          { name: 'TYPE_UNSPECIFIED', value: 'TYPE_UNSPECIFIED' },
          { name: 'TYPE_INVITATION', value: 'TYPE_INVITATION' },
          { name: 'TYPE_INTRODUCTION', value: 'TYPE_INTRODUCTION' },
          { name: 'TYPE_GROUP', value: 'TYPE_GROUP' },
          { name: 'TYPE_ONE_TO_ONE', value: 'TYPE_ONE_TO_ONE' },
        ],
        default: 'TYPE_UNSPECIFIED',
      },
      {
        displayName: 'Filter | DisplayNameSearch',
        name: 'displayNameSearch',
        type: 'string',


        default: '',
      },
      {
        displayName: 'Filter | MinTimestamp',
        name: 'minTimestamp',
        type: 'number',


        default: 0,
      },
      {
        displayName: 'Filter | MaxTimestamp',
        name: 'maxTimestamp',
        type: 'number',


        default: 0,
      },
    ],
  },
  {
    displayName: 'InvitationIds - List',
    name: 'invitationIdsList',
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
            displayName: 'InvitationIds',
            name: 'invitationIds',
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
    updates: ['InvitationUpdated'],
  },
};

export const invitationUpdatedProperties = updateDisplayOptions(displayOptions, properties);

export function invitationUpdated(this: ITriggerFunctions, client: OlvidClient, onCallback?: Function, returnMockData: boolean = false): Function {
    const count: bigint | undefined = this.getNodeParameter('count') ? BigInt(this.getNodeParameter('count') as number) : undefined;
    function getFilter(this: ITriggerFunctions, ): datatypes.InvitationFilter | undefined {
        const itemFilter = this.getNodeParameter('filter') as IDataObject | undefined;
        if (itemFilter === undefined) {
            return undefined;
        }
        function getStatus(this: ITriggerFunctions, itemInvitationFilter: IDataObject): datatypes.Invitation_Status | undefined {
            const value: string | number | undefined = itemInvitationFilter['status'] as string | number | undefined;
            if (value === undefined) {
                return undefined;
            }
            if (typeof value == 'number') {
                if (datatypes.Invitation_Status [value] === undefined) {
                    throw new Error('The attachment type "${value}" is not known.');
                }
                return value as datatypes.Invitation_Status;
            }
            else {
                const enumKey = value.replace("STATUS_", "");
                return datatypes.Invitation_Status [enumKey as keyof typeof datatypes.Invitation_Status];
            }
        }
        const status: datatypes.Invitation_Status | undefined = getStatus.call(this, itemFilter);
        function getType(this: ITriggerFunctions, itemInvitationFilter: IDataObject): datatypes.InvitationFilter_Type | undefined {
            const value: string | number | undefined = itemInvitationFilter['type'] as string | number | undefined;
            if (value === undefined) {
                return undefined;
            }
            if (typeof value == 'number') {
                if (datatypes.InvitationFilter_Type [value] === undefined) {
                    throw new Error('The attachment type "${value}" is not known.');
                }
                return value as datatypes.InvitationFilter_Type;
            }
            else {
                const enumKey = value.replace("TYPE_", "");
                return datatypes.InvitationFilter_Type [enumKey as keyof typeof datatypes.InvitationFilter_Type];
            }
        }
        const type: datatypes.InvitationFilter_Type | undefined = getType.call(this, itemFilter);
        const displayNameSearch: string | undefined = itemFilter['displayNameSearch'] ? itemFilter['displayNameSearch'] as string : undefined;
        const minTimestamp: bigint | undefined = itemFilter['minTimestamp'] ? BigInt(itemFilter['minTimestamp'] as number) : undefined;
        const maxTimestamp: bigint | undefined = itemFilter['maxTimestamp'] ? BigInt(itemFilter['maxTimestamp'] as number) : undefined;
        return new datatypes.InvitationFilter({
            status,
            type,
            displayNameSearch,
            minTimestamp,
            maxTimestamp,
        });
    }
    const filter: datatypes.InvitationFilter | undefined = getFilter.call(this, );
    function getInvitationIds(this: ITriggerFunctions, ): bigint[] {
        const invitationIdsCollectionParent: IDataObject | undefined = this.getNodeParameter('invitationIdsList') as IDataObject | undefined;
        if (invitationIdsCollectionParent === undefined) {
            return [];
        }
        const invitationIdsCollection: IDataObject[] | undefined = invitationIdsCollectionParent['collection'] as IDataObject[] | undefined;
        if (invitationIdsCollection === undefined) {
            return [];
        }
        const invitationIdsList: bigint[] = [];
        for (const itemInvitationIds of invitationIdsCollection) {
            const invitationIds: bigint = BigInt(itemInvitationIds['invitationIds'] as number);
            invitationIdsList.push(invitationIds);
        }
        return invitationIdsList;
    }
    const invitationIds: bigint[] = getInvitationIds.call(this, );

    if (returnMockData) {
        this.emit([this.helpers.returnJsonArray([{
// invitation.mockData,
// previousInvitationStatus.mockData
        }])]);
        onCallback?.();
        return () => {};
    }

	const callback = (notification: notifications.InvitationUpdatedNotification) => {
		this.emit([this.helpers.returnJsonArray([{invitation: {id: Number(notification?.invitation?.id), status: datatypes.Invitation_Status[notification?.invitation?.status ?? 0], displayName: notification?.invitation?.displayName, timestamp: Number(notification?.invitation?.timestamp), sas: notification?.invitation?.sas}},{previousInvitationStatus: datatypes.Invitation_Status[notification?.previousInvitationStatus ?? 0]
}])]);
		onCallback?.();
	}

	return client.stubs.invitationNotificationStub.invitationUpdated({count, filter, invitationIds}, callback, () => {});

}
