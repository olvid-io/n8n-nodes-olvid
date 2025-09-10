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
  {
    displayName: 'MessageIds - List',
    name: 'messageIdsList',
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
            displayName: 'MessageIds',
            name: 'messageIds',
            type: 'collection',
            default: {
              type: 'TYPE_UNSPECIFIED',
              id: 0,
            },
            options: [
              {
                displayName: 'MessageIds | Type',
                name: 'type',
                type: 'options',

                options: [
                  { name: 'TYPE_UNSPECIFIED', value: 'TYPE_UNSPECIFIED' },
                  { name: 'TYPE_INBOUND', value: 'TYPE_INBOUND' },
                  { name: 'TYPE_OUTBOUND', value: 'TYPE_OUTBOUND' },
                ],
                default: 'TYPE_UNSPECIFIED',
              },
              {
                displayName: 'MessageIds | Id',
                name: 'id',
                type: 'number',


                default: 0,
              },
            ],
          },
        ],
      },
    ],
  },
  {
    displayName: 'MessageFilter',
    name: 'messageFilter',
    type: 'collection',
    default: {
    },
    options: [
      {
        displayName: 'MessageFilter | Type',
        name: 'type',
        type: 'options',

        options: [
          { name: 'TYPE_UNSPECIFIED', value: 'TYPE_UNSPECIFIED' },
          { name: 'TYPE_INBOUND', value: 'TYPE_INBOUND' },
          { name: 'TYPE_OUTBOUND', value: 'TYPE_OUTBOUND' },
        ],
        default: 'TYPE_UNSPECIFIED',
      },
      {
        displayName: 'MessageFilter | DiscussionId',
        name: 'discussionId',
        type: 'number',


        default: 0,
      },
      {
        displayName: 'MessageFilter | SenderContactId',
        name: 'senderContactId',
        type: 'number',


        default: 0,
      },
      {
        displayName: 'MessageFilter | BodySearch',
        name: 'bodySearch',
        type: 'string',


        default: '',
      },
      {
        displayName: 'MessageFilter | Attachment',
        name: 'attachment',
        type: 'options',

        options: [
          { name: 'ATTACHMENT_UNSPECIFIED', value: 'ATTACHMENT_UNSPECIFIED' },
          { name: 'ATTACHMENT_HAVE', value: 'ATTACHMENT_HAVE' },
          { name: 'ATTACHMENT_HAVE_NOT', value: 'ATTACHMENT_HAVE_NOT' },
        ],
        default: 'ATTACHMENT_UNSPECIFIED',
      },
      {
        displayName: 'MessageFilter | Location',
        name: 'location',
        type: 'options',

        options: [
          { name: 'LOCATION_UNSPECIFIED', value: 'LOCATION_UNSPECIFIED' },
          { name: 'LOCATION_HAVE', value: 'LOCATION_HAVE' },
          { name: 'LOCATION_HAVE_NOT', value: 'LOCATION_HAVE_NOT' },
          { name: 'LOCATION_IS_SEND', value: 'LOCATION_IS_SEND' },
          { name: 'LOCATION_IS_SHARING', value: 'LOCATION_IS_SHARING' },
          { name: 'LOCATION_IS_SHARING_FINISHED', value: 'LOCATION_IS_SHARING_FINISHED' },
        ],
        default: 'LOCATION_UNSPECIFIED',
      },
      {
        displayName: 'MessageFilter | MinTimestamp',
        name: 'minTimestamp',
        type: 'number',


        default: 0,
      },
      {
        displayName: 'MessageFilter | MaxTimestamp',
        name: 'maxTimestamp',
        type: 'number',


        default: 0,
      },
      {
        displayName: 'MessageFilter | HasReaction',
        name: 'hasReaction',
        type: 'options',

        options: [
          { name: 'REACTION_UNSPECIFIED', value: 'REACTION_UNSPECIFIED' },
          { name: 'REACTION_HAS', value: 'REACTION_HAS' },
          { name: 'REACTION_HAS_NOT', value: 'REACTION_HAS_NOT' },
        ],
        default: 'REACTION_UNSPECIFIED',
      },
      {
        displayName: 'MessageFilter | ReactionsFilter- List',
        name: 'reactionsFilterList',
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
                displayName: 'MessageFilter | ReactionsFilter',
                name: 'reactionsFilter',
                type: 'collection',
                default: {
                  reactedBySelect: 'undefined',
                  reactedByMe: false,
                  reactedByContactId: 0,
                },
                options: [
                  {
                    displayName: 'MessageFilter | ReactionsFilter| ReactedByMe',
                    name: 'reactedBySelect',
                    type: 'options',
                    options: [
                      { name: 'Select', value: 'undefined' },
                      { name: 'reactedByMe', value: 'reactedByMe' },
                      { name: 'reactedByContactId', value: 'reactedByContactId' },
                    ],
                    default: 'undefined',
                  },
                  {
                    displayName: 'MessageFilter | ReactionsFilter| ReactedByMe - ReactedByMe',
                    name: 'reactedByMe',
                    type: 'boolean',


                    default: false,
                  },
                  {
                    displayName: 'MessageFilter | ReactionsFilter| ReactedByMe - ReactedByContactId',
                    name: 'reactedByContactId',
                    type: 'number',


                    default: 0,
                  },
                  {
                    displayName: 'MessageFilter | ReactionsFilter| Reaction',
                    name: 'reaction',
                    type: 'string',


                    default: '',
                  },
                ],
              },
            ],
          },
        ],
      },
      {
        displayName: 'MessageFilter | ReplyToAMessage',
        name: 'replySelect',
        type: 'options',
        options: [
          { name: 'Select', value: 'undefined' },
          { name: 'replyToAMessage', value: 'replyToAMessage' },
          { name: 'doNotReplyToAMessage', value: 'doNotReplyToAMessage' },
          { name: 'repliedMessageId', value: 'repliedMessageId' },
        ],
        default: 'undefined',
      },
      {
        displayName: 'MessageFilter | ReplyToAMessage - ReplyToAMessage',
        name: 'replyToAMessage',
        type: 'boolean',


        default: false,
      },
      {
        displayName: 'MessageFilter | ReplyToAMessage - DoNotReplyToAMessage',
        name: 'doNotReplyToAMessage',
        type: 'boolean',


        default: false,
      },
      {
        displayName: 'MessageFilter | ReplyToAMessage - RepliedMessageId',
        name: 'repliedMessageId',
        type: 'collection',
        default: {
          type: 'TYPE_UNSPECIFIED',
          id: 0,
        },
        options: [
          {
            displayName: 'MessageFilter | ReplyToAMessage - RepliedMessageId| Type',
            name: 'type',
            type: 'options',

            options: [
              { name: 'TYPE_UNSPECIFIED', value: 'TYPE_UNSPECIFIED' },
              { name: 'TYPE_INBOUND', value: 'TYPE_INBOUND' },
              { name: 'TYPE_OUTBOUND', value: 'TYPE_OUTBOUND' },
            ],
            default: 'TYPE_UNSPECIFIED',
          },
          {
            displayName: 'MessageFilter | ReplyToAMessage - RepliedMessageId| Id',
            name: 'id',
            type: 'number',


            default: 0,
          },
        ],
      },
    ],
  },
  {
    displayName: 'ReactionFilter',
    name: 'reactionFilter',
    type: 'collection',
    default: {
    },
    options: [
      {
        displayName: 'ReactionFilter | ReactedByMe',
        name: 'reactedBySelect',
        type: 'options',
        options: [
          { name: 'Select', value: 'undefined' },
          { name: 'reactedByMe', value: 'reactedByMe' },
          { name: 'reactedByContactId', value: 'reactedByContactId' },
        ],
        default: 'undefined',
      },
      {
        displayName: 'ReactionFilter | ReactedByMe - ReactedByMe',
        name: 'reactedByMe',
        type: 'boolean',


        default: false,
      },
      {
        displayName: 'ReactionFilter | ReactedByMe - ReactedByContactId',
        name: 'reactedByContactId',
        type: 'number',


        default: 0,
      },
      {
        displayName: 'ReactionFilter | Reaction',
        name: 'reaction',
        type: 'string',


        default: '',
      },
    ],
  },
  {
    displayName: 'PreviousReactionFilter',
    name: 'previousReactionFilter',
    type: 'collection',
    default: {
    },
    options: [
      {
        displayName: 'PreviousReactionFilter | ReactedByMe',
        name: 'reactedBySelect',
        type: 'options',
        options: [
          { name: 'Select', value: 'undefined' },
          { name: 'reactedByMe', value: 'reactedByMe' },
          { name: 'reactedByContactId', value: 'reactedByContactId' },
        ],
        default: 'undefined',
      },
      {
        displayName: 'PreviousReactionFilter | ReactedByMe - ReactedByMe',
        name: 'reactedByMe',
        type: 'boolean',


        default: false,
      },
      {
        displayName: 'PreviousReactionFilter | ReactedByMe - ReactedByContactId',
        name: 'reactedByContactId',
        type: 'number',


        default: 0,
      },
      {
        displayName: 'PreviousReactionFilter | Reaction',
        name: 'reaction',
        type: 'string',


        default: '',
      },
    ],
  },
];

const displayOptions = {
  show: {
    updates: ['MessageReactionUpdated'],
  },
};

export const messageReactionUpdatedProperties = updateDisplayOptions(displayOptions, properties);

export function messageReactionUpdated(this: ITriggerFunctions, client: OlvidClient, onCallback?: Function, returnMockData: boolean = false): Function {
    const count: bigint | undefined = this.getNodeParameter('count') ? BigInt(this.getNodeParameter('count') as number) : undefined;
    function getMessageIds(this: ITriggerFunctions, ): datatypes.MessageId[] {
        function getMessageIds(this: ITriggerFunctions, itemSubscribeToMessageReactionUpdatedNotification: IDataObject): datatypes.MessageId {
            const itemMessageIds = itemSubscribeToMessageReactionUpdatedNotification['messageIds'] as IDataObject;
            function getType(this: ITriggerFunctions, itemMessageId: IDataObject): datatypes.MessageId_Type {
                const value: string | number = itemMessageId['type'] as string | number;

                if (typeof value == 'number') {
                    if (datatypes.MessageId_Type [value] === undefined) {
                        throw new Error('The attachment type "${value}" is not known.');
                    }
                    return value as datatypes.MessageId_Type;
                }
                else {
                    const enumKey = value.replace("TYPE_", "");
                    return datatypes.MessageId_Type [enumKey as keyof typeof datatypes.MessageId_Type];
                }
            }
            const type: datatypes.MessageId_Type = getType.call(this, itemMessageIds);
            const id: bigint = BigInt(itemMessageIds['id'] as number);
            return create(datatypes.MessageIdSchema, {
                type,
                id,
            });
        }
        const messageIdsCollectionParent: IDataObject | undefined = this.getNodeParameter('messageIdsList') as IDataObject | undefined;
        if (messageIdsCollectionParent === undefined) {
            return [];
        }
        const messageIdsCollection: IDataObject[] | undefined = messageIdsCollectionParent['collection'] as IDataObject[] | undefined;
        if (messageIdsCollection === undefined) {
            return [];
        }
        const messageIdsList: datatypes.MessageId[] = [];
        for (const itemMessageIds of messageIdsCollection) {
            const messageIds: datatypes.MessageId = getMessageIds.call(this, itemMessageIds);
            messageIdsList.push(messageIds);
        }
        return messageIdsList;
    }
    const messageIds: datatypes.MessageId[] = getMessageIds.call(this, );
    function getMessageFilter(this: ITriggerFunctions, ): datatypes.MessageFilter | undefined {
        const itemMessageFilter = this.getNodeParameter('messageFilter') as IDataObject | undefined;
        if (itemMessageFilter === undefined) {
            return undefined;
        }
        function getType(this: ITriggerFunctions, itemMessageFilter: IDataObject): datatypes.MessageId_Type | undefined {
            const value: string | number | undefined = itemMessageFilter['type'] as string | number | undefined;
            if (value === undefined) {
                return undefined;
            }
            if (typeof value == 'number') {
                if (datatypes.MessageId_Type [value] === undefined) {
                    throw new Error('The attachment type "${value}" is not known.');
                }
                return value as datatypes.MessageId_Type;
            }
            else {
                const enumKey = value.replace("TYPE_", "");
                return datatypes.MessageId_Type [enumKey as keyof typeof datatypes.MessageId_Type];
            }
        }
        const type: datatypes.MessageId_Type | undefined = getType.call(this, itemMessageFilter);
        const discussionId: bigint | undefined = itemMessageFilter['discussionId'] ? BigInt(itemMessageFilter['discussionId'] as number) : undefined;
        const senderContactId: bigint | undefined = itemMessageFilter['senderContactId'] ? BigInt(itemMessageFilter['senderContactId'] as number) : undefined;
        const bodySearch: string | undefined = itemMessageFilter['bodySearch'] ? itemMessageFilter['bodySearch'] as string : undefined;
        function getAttachment(this: ITriggerFunctions, itemMessageFilter: IDataObject): datatypes.MessageFilter_Attachment | undefined {
            const value: string | number | undefined = itemMessageFilter['attachment'] as string | number | undefined;
            if (value === undefined) {
                return undefined;
            }
            if (typeof value == 'number') {
                if (datatypes.MessageFilter_Attachment [value] === undefined) {
                    throw new Error('The attachment type "${value}" is not known.');
                }
                return value as datatypes.MessageFilter_Attachment;
            }
            else {
                const enumKey = value.replace("ATTACHMENT_", "");
                return datatypes.MessageFilter_Attachment [enumKey as keyof typeof datatypes.MessageFilter_Attachment];
            }
        }
        const attachment: datatypes.MessageFilter_Attachment | undefined = getAttachment.call(this, itemMessageFilter);
        function getLocation(this: ITriggerFunctions, itemMessageFilter: IDataObject): datatypes.MessageFilter_Location | undefined {
            const value: string | number | undefined = itemMessageFilter['location'] as string | number | undefined;
            if (value === undefined) {
                return undefined;
            }
            if (typeof value == 'number') {
                if (datatypes.MessageFilter_Location [value] === undefined) {
                    throw new Error('The attachment type "${value}" is not known.');
                }
                return value as datatypes.MessageFilter_Location;
            }
            else {
                const enumKey = value.replace("LOCATION_", "");
                return datatypes.MessageFilter_Location [enumKey as keyof typeof datatypes.MessageFilter_Location];
            }
        }
        const location: datatypes.MessageFilter_Location | undefined = getLocation.call(this, itemMessageFilter);
        const minTimestamp: bigint | undefined = itemMessageFilter['minTimestamp'] ? BigInt(itemMessageFilter['minTimestamp'] as number) : undefined;
        const maxTimestamp: bigint | undefined = itemMessageFilter['maxTimestamp'] ? BigInt(itemMessageFilter['maxTimestamp'] as number) : undefined;
        function getHasReaction(this: ITriggerFunctions, itemMessageFilter: IDataObject): datatypes.MessageFilter_Reaction | undefined {
            const value: string | number | undefined = itemMessageFilter['hasReaction'] as string | number | undefined;
            if (value === undefined) {
                return undefined;
            }
            if (typeof value == 'number') {
                if (datatypes.MessageFilter_Reaction [value] === undefined) {
                    throw new Error('The attachment type "${value}" is not known.');
                }
                return value as datatypes.MessageFilter_Reaction;
            }
            else {
                const enumKey = value.replace("HASREACTION_", "");
                return datatypes.MessageFilter_Reaction [enumKey as keyof typeof datatypes.MessageFilter_Reaction];
            }
        }
        const hasReaction: datatypes.MessageFilter_Reaction | undefined = getHasReaction.call(this, itemMessageFilter);
        function getReactionsFilter(this: ITriggerFunctions, itemMessageFilter: IDataObject): datatypes.ReactionFilter[] | undefined {
            function getReactionsFilter(this: ITriggerFunctions, itemMessageFilter: IDataObject): datatypes.ReactionFilter {
                const itemReactionsFilter = itemMessageFilter['reactionsFilter'] as IDataObject;
                type reactedByType =
                    { value?: undefined, case: undefined } |
                    { value: boolean, case: "reactedByMe" } |
                    { value: bigint, case: "reactedByContactId" };
                function getReactedBy(this: ITriggerFunctions, itemReactionFilter: IDataObject): reactedByType {
                    const selectedCase: string | undefined = itemReactionFilter['reactedBySelect'] as string | undefined;
                    if (selectedCase === undefined) {
                        return { case: undefined };
                    }

                    if (selectedCase === "reactedByMe") {
                        const reactedByMe: boolean = itemReactionFilter['reactedByMe'] as boolean;
                        return { value: reactedByMe, case: "reactedByMe" };
                    }
                    if (selectedCase === "reactedByContactId") {
                        const reactedByContactId: bigint = BigInt(itemReactionFilter['reactedByContactId'] as number);
                        return { value: reactedByContactId, case: "reactedByContactId" };
                    }
                    return { case: undefined };
                }
                const reactedBy: reactedByType = getReactedBy.call(this, itemReactionsFilter);
                const reaction: string | undefined = itemReactionsFilter['reaction'] ? itemReactionsFilter['reaction'] as string : undefined;
                return create(datatypes.ReactionFilterSchema, {
                    reaction,
                    reactedBy,
                });
            }
            const reactionsFilterCollectionParent: IDataObject | undefined = itemMessageFilter['reactionsFilterList'] as IDataObject | undefined;
            if (reactionsFilterCollectionParent === undefined) {
                return [];
            }
            const reactionsFilterCollection: IDataObject[] | undefined = reactionsFilterCollectionParent['collection'] as IDataObject[] | undefined;
            if (reactionsFilterCollection === undefined) {
                return [];
            }
            const reactionsFilterList: datatypes.ReactionFilter[] = [];
            for (const itemReactionsFilter of reactionsFilterCollection) {
                const reactionsFilter: datatypes.ReactionFilter = getReactionsFilter.call(this, itemReactionsFilter);
                reactionsFilterList.push(reactionsFilter);
            }
            return reactionsFilterList;
        }
        const reactionsFilter: datatypes.ReactionFilter[] | undefined = getReactionsFilter.call(this, itemMessageFilter);
        type replyType =
            { value?: undefined, case: undefined } |
            { value: boolean, case: "replyToAMessage" } |
            { value: boolean, case: "doNotReplyToAMessage" } |
            { value: datatypes.MessageId, case: "repliedMessageId" };
        function getReply(this: ITriggerFunctions, itemMessageFilter: IDataObject): replyType {
            const selectedCase: string | undefined = itemMessageFilter['replySelect'] as string | undefined;
            if (selectedCase === undefined) {
                return { case: undefined };
            }
            function getRepliedMessageId(this: ITriggerFunctions, itemMessageFilter: IDataObject): datatypes.MessageId {
                const itemRepliedMessageId = itemMessageFilter['repliedMessageId'] as IDataObject;
                function getType(this: ITriggerFunctions, itemMessageId: IDataObject): datatypes.MessageId_Type {
                    const value: string | number = itemMessageId['type'] as string | number;

                    if (typeof value == 'number') {
                        if (datatypes.MessageId_Type [value] === undefined) {
                            throw new Error('The attachment type "${value}" is not known.');
                        }
                        return value as datatypes.MessageId_Type;
                    }
                    else {
                        const enumKey = value.replace("TYPE_", "");
                        return datatypes.MessageId_Type [enumKey as keyof typeof datatypes.MessageId_Type];
                    }
                }
                const type: datatypes.MessageId_Type = getType.call(this, itemRepliedMessageId);
                const id: bigint = BigInt(itemRepliedMessageId['id'] as number);
                return create(datatypes.MessageIdSchema, {
                    type,
                    id,
                });
            }

            if (selectedCase === "replyToAMessage") {
                const replyToAMessage: boolean = itemMessageFilter['replyToAMessage'] as boolean;
                return { value: replyToAMessage, case: "replyToAMessage" };
            }
            if (selectedCase === "doNotReplyToAMessage") {
                const doNotReplyToAMessage: boolean = itemMessageFilter['doNotReplyToAMessage'] as boolean;
                return { value: doNotReplyToAMessage, case: "doNotReplyToAMessage" };
            }
            if (selectedCase === "repliedMessageId") {
                const repliedMessageId: datatypes.MessageId = getRepliedMessageId.call(this, itemMessageFilter);
                return { value: repliedMessageId, case: "repliedMessageId" };
            }
            return { case: undefined };
        }
        const reply: replyType | undefined = getReply.call(this, itemMessageFilter);
        return create(datatypes.MessageFilterSchema, {
            type,
            discussionId,
            senderContactId,
            bodySearch,
            attachment,
            location,
            minTimestamp,
            maxTimestamp,
            hasReaction,
            reactionsFilter,
            reply,
        });
    }
    const messageFilter: datatypes.MessageFilter | undefined = getMessageFilter.call(this, );
    function getReactionFilter(this: ITriggerFunctions, ): datatypes.ReactionFilter | undefined {
        const itemReactionFilter = this.getNodeParameter('reactionFilter') as IDataObject | undefined;
        if (itemReactionFilter === undefined) {
            return undefined;
        }
        type reactedByType =
            { value?: undefined, case: undefined } |
            { value: boolean, case: "reactedByMe" } |
            { value: bigint, case: "reactedByContactId" };
        function getReactedBy(this: ITriggerFunctions, itemReactionFilter: IDataObject): reactedByType {
            const selectedCase: string | undefined = itemReactionFilter['reactedBySelect'] as string | undefined;
            if (selectedCase === undefined) {
                return { case: undefined };
            }

            if (selectedCase === "reactedByMe") {
                const reactedByMe: boolean = itemReactionFilter['reactedByMe'] as boolean;
                return { value: reactedByMe, case: "reactedByMe" };
            }
            if (selectedCase === "reactedByContactId") {
                const reactedByContactId: bigint = BigInt(itemReactionFilter['reactedByContactId'] as number);
                return { value: reactedByContactId, case: "reactedByContactId" };
            }
            return { case: undefined };
        }
        const reactedBy: reactedByType | undefined = getReactedBy.call(this, itemReactionFilter);
        const reaction: string | undefined = itemReactionFilter['reaction'] ? itemReactionFilter['reaction'] as string : undefined;
        return create(datatypes.ReactionFilterSchema, {
            reaction,
            reactedBy,
        });
    }
    const reactionFilter: datatypes.ReactionFilter | undefined = getReactionFilter.call(this, );
    function getPreviousReactionFilter(this: ITriggerFunctions, ): datatypes.ReactionFilter | undefined {
        const itemPreviousReactionFilter = this.getNodeParameter('previousReactionFilter') as IDataObject | undefined;
        if (itemPreviousReactionFilter === undefined) {
            return undefined;
        }
        type reactedByType =
            { value?: undefined, case: undefined } |
            { value: boolean, case: "reactedByMe" } |
            { value: bigint, case: "reactedByContactId" };
        function getReactedBy(this: ITriggerFunctions, itemReactionFilter: IDataObject): reactedByType {
            const selectedCase: string | undefined = itemReactionFilter['reactedBySelect'] as string | undefined;
            if (selectedCase === undefined) {
                return { case: undefined };
            }

            if (selectedCase === "reactedByMe") {
                const reactedByMe: boolean = itemReactionFilter['reactedByMe'] as boolean;
                return { value: reactedByMe, case: "reactedByMe" };
            }
            if (selectedCase === "reactedByContactId") {
                const reactedByContactId: bigint = BigInt(itemReactionFilter['reactedByContactId'] as number);
                return { value: reactedByContactId, case: "reactedByContactId" };
            }
            return { case: undefined };
        }
        const reactedBy: reactedByType | undefined = getReactedBy.call(this, itemPreviousReactionFilter);
        const reaction: string | undefined = itemPreviousReactionFilter['reaction'] ? itemPreviousReactionFilter['reaction'] as string : undefined;
        return create(datatypes.ReactionFilterSchema, {
            reaction,
            reactedBy,
        });
    }
    const previousReactionFilter: datatypes.ReactionFilter | undefined = getPreviousReactionFilter.call(this, );

    if (returnMockData) {
        this.emit([this.helpers.returnJsonArray([{
// message.mockData,
// reaction.mockData,
// previousReaction.mockData
        }])]);
        onCallback?.();
        return () => {};
    }

	const callback = (notification: notifications.MessageReactionUpdatedNotification) => {
		this.emit([this.helpers.returnJsonArray([{message: {id: {type: datatypes.MessageId_Type[notification?.message?.id?.type ?? 0], id: Number(notification?.message?.id?.id)}, discussionId: Number(notification?.message?.discussionId), senderId: Number(notification?.message?.senderId), body: notification?.message?.body, sortIndex: notification?.message?.sortIndex, timestamp: Number(notification?.message?.timestamp), attachmentsCount: Number(notification?.message?.attachmentsCount), repliedMessageId: {type: datatypes.MessageId_Type[notification?.message?.repliedMessageId?.type ?? 0], id: Number(notification?.message?.repliedMessageId?.id)}, messageLocation: {type: datatypes.MessageLocation_LocationType[notification?.message?.messageLocation?.type ?? 0], timestamp: Number(notification?.message?.messageLocation?.timestamp), latitude: notification?.message?.messageLocation?.latitude, longitude: notification?.message?.messageLocation?.longitude, altitude: notification?.message?.messageLocation?.altitude, precision: notification?.message?.messageLocation?.precision, address: notification?.message?.messageLocation?.address}, reactions: notification?.message?.reactions.map(e => ({contactId: Number(e.contactId), reaction: e.reaction, timestamp: Number(e.timestamp)})), forwarded: notification?.message?.forwarded, editedBody: notification?.message?.editedBody}},{reaction: {contactId: Number(notification?.reaction?.contactId), reaction: notification?.reaction?.reaction, timestamp: Number(notification?.reaction?.timestamp)}},{previousReaction: {contactId: Number(notification?.previousReaction?.contactId), reaction: notification?.previousReaction?.reaction, timestamp: Number(notification?.previousReaction?.timestamp)}}])]);
		onCallback?.();
	}

	return client.stubs.messageNotificationStub.messageReactionUpdated({count, messageIds, messageFilter, reactionFilter, previousReactionFilter}, callback, () => {});

}
