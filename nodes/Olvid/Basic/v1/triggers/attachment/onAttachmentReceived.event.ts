/* eslint-disable n8n-nodes-base/node-param-default-wrong-for-options,n8n-nodes-base/node-param-collection-type-unsorted-items */
import * as datatypes from '../../../../protobuf/olvid/daemon/datatypes/v1/datatypes';
import {
	type IDisplayOptions,
	type INodeProperties,
	updateDisplayOptions,
} from 'n8n-workflow';
import {discussionIdPicker} from "../../../../common-properties/discussionIdPicker";

const parameters: INodeProperties[] = [
	{
		displayName: 'Download Attachments',
		name: 'downloadAttachments',
		type: 'boolean',
		default: true,
		description: 'Download attachments from the message',
	},
	// attachment filters
	{
		displayName: 'Attachment filters',
		default: {},
		description: 'Advanced filters for attachment-related triggers',
		name: 'attachmentFilters',
		type: 'collection',
		options: [
			{
				displayName: 'Filename Contains (regex)',
				name: 'filenameSearch',
				type: 'string',
				default: '',
				placeholder: '.pdf',
				description: 'Filter attachments whose filename match this regex',
			},
			{
				displayName: 'File Type',
				name: 'fileType',
				type: 'options',
				options: [
					{ name: 'Any', value: datatypes.AttachmentFilter_FileType.UNSPECIFIED.valueOf() },
					{ name: 'Audio', value: datatypes.AttachmentFilter_FileType.AUDIO.valueOf() },
					{ name: 'Images', value: datatypes.AttachmentFilter_FileType.IMAGE.valueOf() },
					{ name: 'Images & Videos', value: datatypes.AttachmentFilter_FileType.IMAGE_VIDEO.valueOf() },
					{ name: 'Link preview', value: datatypes.AttachmentFilter_FileType.LINK_PREVIEW.valueOf() },
					{ name: 'Not link preview', value: datatypes.AttachmentFilter_FileType.NOT_LINK_PREVIEW.valueOf() },
					{ name: 'Videos', value: datatypes.AttachmentFilter_FileType.VIDEO.valueOf() },
				],
				default: datatypes.AttachmentFilter_FileType.UNSPECIFIED.valueOf(),
				description: 'Filter by attachment file type',
			},
			{
				...discussionIdPicker,
				displayName: 'In a specific Discussion',
				description: 'Filter attachments from a specific discussion ID (0 = any discussion)',
			},
			{
				displayName: 'Maximum Size (bytes)',
				name: 'maxSize',
				type: 'number',
				default: 0,
				description: 'Maximum file size in bytes (0 = no maximum)',
			},
			{
				displayName: 'Minimum Size (bytes)',
				name: 'minSize',
				type: 'number',
				default: 0,
				description: 'Minimum file size in bytes (0 = no minimum)',
			},
			{
				displayName: 'MIME Type Contains (regex)',
				name: 'mimeTypeSearch',
				type: 'string',
				default: '',
				placeholder: 'image/',
				description: 'Filter attachments whose MIME type match this regex',
			},
		],
	},
]

const displayOptions: IDisplayOptions = {
	show: {
		updates: ['attachmentReceived'],
	},
};

export const attachmentReceivedParameters = updateDisplayOptions(displayOptions, parameters);
