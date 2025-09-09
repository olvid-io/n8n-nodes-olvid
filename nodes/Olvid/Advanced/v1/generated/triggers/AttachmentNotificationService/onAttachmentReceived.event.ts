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
          { name: 'TYPE_INBOUND', value: 'TYPE_INBOUND' },
          { name: 'TYPE_OUTBOUND', value: 'TYPE_OUTBOUND' },
        ],
        default: 'TYPE_UNSPECIFIED',
      },
      {
        displayName: 'Filter | FileType',
        name: 'fileType',
        type: 'options',

        options: [
          { name: 'FILE_TYPE_UNSPECIFIED', value: 'FILE_TYPE_UNSPECIFIED' },
          { name: 'FILE_TYPE_IMAGE', value: 'FILE_TYPE_IMAGE' },
          { name: 'FILE_TYPE_VIDEO', value: 'FILE_TYPE_VIDEO' },
          { name: 'FILE_TYPE_IMAGE_VIDEO', value: 'FILE_TYPE_IMAGE_VIDEO' },
          { name: 'FILE_TYPE_AUDIO', value: 'FILE_TYPE_AUDIO' },
          { name: 'FILE_TYPE_LINK_PREVIEW', value: 'FILE_TYPE_LINK_PREVIEW' },
          { name: 'FILE_TYPE_NOT_LINK_PREVIEW', value: 'FILE_TYPE_NOT_LINK_PREVIEW' },
        ],
        default: 'FILE_TYPE_UNSPECIFIED',
      },
      {
        displayName: 'Filter | DiscussionId',
        name: 'discussionId',
        type: 'number',


        default: 0,
      },
      {
        displayName: 'Filter | MessageId',
        name: 'messageId',
        type: 'collection',
        default: {
        },
        options: [
          {
            displayName: 'Filter | MessageId| Type',
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
            displayName: 'Filter | MessageId| Id',
            name: 'id',
            type: 'number',


            default: 0,
          },
        ],
      },
      {
        displayName: 'Filter | FilenameSearch',
        name: 'filenameSearch',
        type: 'string',


        default: '',
      },
      {
        displayName: 'Filter | MimeTypeSearch',
        name: 'mimeTypeSearch',
        type: 'string',


        default: '',
      },
      {
        displayName: 'Filter | MinSize',
        name: 'minSize',
        type: 'number',


        default: 0,
      },
      {
        displayName: 'Filter | MaxSize',
        name: 'maxSize',
        type: 'number',


        default: 0,
      },
    ],
  },
];

const displayOptions = {
  show: {
    updates: ['AttachmentReceived'],
  },
};

export const attachmentReceivedProperties = updateDisplayOptions(displayOptions, properties);

export function attachmentReceived(this: ITriggerFunctions, client: OlvidClient, onCallback?: Function, returnMockData: boolean = false): Function {
    const count: bigint | undefined = this.getNodeParameter('count') ? BigInt(this.getNodeParameter('count') as number) : undefined;
    function getFilter(this: ITriggerFunctions, ): datatypes.AttachmentFilter | undefined {
        const itemFilter = this.getNodeParameter('filter') as IDataObject | undefined;
        if (itemFilter === undefined) {
            return undefined;
        }
        function getType(this: ITriggerFunctions, itemAttachmentFilter: IDataObject): datatypes.AttachmentId_Type | undefined {
            const value: string | number | undefined = itemAttachmentFilter['type'] as string | number | undefined;
            if (value === undefined) {
                return undefined;
            }
            if (typeof value == 'number') {
                if (datatypes.AttachmentId_Type [value] === undefined) {
                    throw new Error('The attachment type "${value}" is not known.');
                }
                return value as datatypes.AttachmentId_Type;
            }
            else {
                const enumKey = value.replace("TYPE_", "");
                return datatypes.AttachmentId_Type [enumKey as keyof typeof datatypes.AttachmentId_Type];
            }
        }
        const type: datatypes.AttachmentId_Type | undefined = getType.call(this, itemFilter);
        function getFileType(this: ITriggerFunctions, itemAttachmentFilter: IDataObject): datatypes.AttachmentFilter_FileType | undefined {
            const value: string | number | undefined = itemAttachmentFilter['fileType'] as string | number | undefined;
            if (value === undefined) {
                return undefined;
            }
            if (typeof value == 'number') {
                if (datatypes.AttachmentFilter_FileType [value] === undefined) {
                    throw new Error('The attachment type "${value}" is not known.');
                }
                return value as datatypes.AttachmentFilter_FileType;
            }
            else {
                const enumKey = value.replace("FILETYPE_", "");
                return datatypes.AttachmentFilter_FileType [enumKey as keyof typeof datatypes.AttachmentFilter_FileType];
            }
        }
        const fileType: datatypes.AttachmentFilter_FileType | undefined = getFileType.call(this, itemFilter);
        const discussionId: bigint | undefined = itemFilter['discussionId'] ? BigInt(itemFilter['discussionId'] as number) : undefined;
        function getMessageId(this: ITriggerFunctions, itemAttachmentFilter: IDataObject): datatypes.MessageId | undefined {
            const itemMessageId = itemAttachmentFilter['messageId'] as IDataObject | undefined;
            if (itemMessageId === undefined) {
                return undefined;
            }
            function getType(this: ITriggerFunctions, itemMessageId: IDataObject): datatypes.MessageId_Type | undefined {
                const value: string | number | undefined = itemMessageId['type'] as string | number | undefined;
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
            const type: datatypes.MessageId_Type | undefined = getType.call(this, itemMessageId);
            const id: bigint | undefined = itemMessageId['id'] ? BigInt(itemMessageId['id'] as number) : undefined;
            return new datatypes.MessageId({
                type,
                id,
            });
        }
        const messageId: datatypes.MessageId | undefined = getMessageId.call(this, itemFilter);
        const filenameSearch: string | undefined = itemFilter['filenameSearch'] ? itemFilter['filenameSearch'] as string : undefined;
        const mimeTypeSearch: string | undefined = itemFilter['mimeTypeSearch'] ? itemFilter['mimeTypeSearch'] as string : undefined;
        const minSize: bigint | undefined = itemFilter['minSize'] ? BigInt(itemFilter['minSize'] as number) : undefined;
        const maxSize: bigint | undefined = itemFilter['maxSize'] ? BigInt(itemFilter['maxSize'] as number) : undefined;
        return new datatypes.AttachmentFilter({
            type,
            fileType,
            discussionId,
            messageId,
            filenameSearch,
            mimeTypeSearch,
            minSize,
            maxSize,
        });
    }
    const filter: datatypes.AttachmentFilter | undefined = getFilter.call(this, );

    if (returnMockData) {
        this.emit([this.helpers.returnJsonArray([{
// attachment.mockData
        }])]);
        onCallback?.();
        return () => {};
    }

	const callback = (notification: notifications.AttachmentReceivedNotification) => {
		this.emit([this.helpers.returnJsonArray({id: {type: datatypes.AttachmentId_Type[notification?.attachment?.id?.type ?? 0], id: Number(notification?.attachment?.id?.id)}, discussionId: Number(notification?.attachment?.discussionId), messageId: {type: datatypes.MessageId_Type[notification?.attachment?.messageId?.type ?? 0], id: Number(notification?.attachment?.messageId?.id)}, fileName: notification?.attachment?.fileName, mimeType: notification?.attachment?.mimeType, size: Number(notification?.attachment?.size)})]);
		onCallback?.();
	}

	return client.stubs.attachmentNotificationStub.attachmentReceived({count, filter}, callback, () => {});

}
