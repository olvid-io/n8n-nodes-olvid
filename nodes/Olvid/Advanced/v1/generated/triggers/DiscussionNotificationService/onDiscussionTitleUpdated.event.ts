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
        displayName: 'Filter | Type',
        name: 'type',
        type: 'options',

        options: [
          { name: 'TYPE_UNSPECIFIED', value: 'TYPE_UNSPECIFIED' },
          { name: 'TYPE_OTO', value: 'TYPE_OTO' },
          { name: 'TYPE_GROUP', value: 'TYPE_GROUP' },
        ],
        default: 'TYPE_UNSPECIFIED',
      },
      {
        displayName: 'Filter | ContactId',
        name: 'identifierSelect',
        type: 'options',
        options: [
          { name: 'Select', value: 'undefined' },
          { name: 'contactId', value: 'contactId' },
          { name: 'groupId', value: 'groupId' },
        ],
        default: 'undefined',
      },
      {
        displayName: 'Filter | ContactId - ContactId',
        name: 'contactId',
        type: 'number',


        default: 0,
      },
      {
        displayName: 'Filter | ContactId - GroupId',
        name: 'groupId',
        type: 'number',


        default: 0,
      },
      {
        displayName: 'Filter | TitleSearch',
        name: 'titleSearch',
        type: 'string',


        default: '',
      },
    ],
  },
  {
    displayName: 'DiscussionIds - List',
    name: 'discussionIdsList',
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
            displayName: 'DiscussionIds',
            name: 'discussionIds',
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
    updates: ['DiscussionTitleUpdated'],
  },
};

export const discussionTitleUpdatedProperties = updateDisplayOptions(displayOptions, properties);

export function discussionTitleUpdated(this: ITriggerFunctions, client: OlvidClient, onCallback?: Function, returnMockData: boolean = false): Function {
    const count: bigint | undefined = this.getNodeParameter('count') ? BigInt(this.getNodeParameter('count') as number) : undefined;
    function getFilter(this: ITriggerFunctions, ): datatypes.DiscussionFilter | undefined {
        const itemFilter = this.getNodeParameter('filter') as IDataObject | undefined;
        if (itemFilter === undefined) {
            return undefined;
        }
        function getType(this: ITriggerFunctions, itemDiscussionFilter: IDataObject): datatypes.DiscussionFilter_Type | undefined {
            const value: string | number | undefined = itemDiscussionFilter['type'] as string | number | undefined;
            if (value === undefined) {
                return undefined;
            }
            if (typeof value == 'number') {
                if (datatypes.DiscussionFilter_Type [value] === undefined) {
                    throw new Error('The attachment type "${value}" is not known.');
                }
                return value as datatypes.DiscussionFilter_Type;
            }
            else {
                const enumKey = value.replace("TYPE_", "");
                return datatypes.DiscussionFilter_Type [enumKey as keyof typeof datatypes.DiscussionFilter_Type];
            }
        }
        const type: datatypes.DiscussionFilter_Type | undefined = getType.call(this, itemFilter);
        type identifierType =
            { value?: undefined, case: undefined } |
            { value: bigint, case: "contactId" } |
            { value: bigint, case: "groupId" };
        function getIdentifier(this: ITriggerFunctions, itemDiscussionFilter: IDataObject): identifierType {
            const selectedCase: string | undefined = itemDiscussionFilter['identifierSelect'] as string | undefined;
            if (selectedCase === undefined) {
                return { case: undefined };
            }

            if (selectedCase === "contactId") {
                const contactId: bigint = BigInt(itemDiscussionFilter['contactId'] as number);
                return { value: contactId, case: "contactId" };
            }
            if (selectedCase === "groupId") {
                const groupId: bigint = BigInt(itemDiscussionFilter['groupId'] as number);
                return { value: groupId, case: "groupId" };
            }
            return { case: undefined };
        }
        const identifier: identifierType | undefined = getIdentifier.call(this, itemFilter);
        const titleSearch: string | undefined = itemFilter['titleSearch'] ? itemFilter['titleSearch'] as string : undefined;
        return new datatypes.DiscussionFilter({
            type,
            titleSearch,
            identifier,
        });
    }
    const filter: datatypes.DiscussionFilter | undefined = getFilter.call(this, );
    function getDiscussionIds(this: ITriggerFunctions, ): bigint[] {
        const discussionIdsCollectionParent: IDataObject | undefined = this.getNodeParameter('discussionIdsList') as IDataObject | undefined;
        if (discussionIdsCollectionParent === undefined) {
            return [];
        }
        const discussionIdsCollection: IDataObject[] | undefined = discussionIdsCollectionParent['collection'] as IDataObject[] | undefined;
        if (discussionIdsCollection === undefined) {
            return [];
        }
        const discussionIdsList: bigint[] = [];
        for (const itemDiscussionIds of discussionIdsCollection) {
            const discussionIds: bigint = BigInt(itemDiscussionIds['discussionIds'] as number);
            discussionIdsList.push(discussionIds);
        }
        return discussionIdsList;
    }
    const discussionIds: bigint[] = getDiscussionIds.call(this, );

    if (returnMockData) {
        this.emit([this.helpers.returnJsonArray([{
// discussion.mockData,
// previousTitle.mockData
        }])]);
        onCallback?.();
        return () => {};
    }

	const callback = (notification: notifications.DiscussionTitleUpdatedNotification) => {
		this.emit([this.helpers.returnJsonArray([{discussion: {id: Number(notification?.discussion?.id), title: notification?.discussion?.title, contactId: notification?.discussion?.identifier.case === 'contactId' ? Number(notification?.discussion?.identifier.value) : undefined, groupId: notification?.discussion?.identifier.case === 'groupId' ? Number(notification?.discussion?.identifier.value) : undefined}},{previousTitle: notification?.previousTitle
}])]);
		onCallback?.();
	}

	return client.stubs.discussionNotificationStub.discussionTitleUpdated({count, filter, discussionIds}, callback, () => {});

}
