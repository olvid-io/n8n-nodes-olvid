/* eslint-disable n8n-nodes-base/node-param-default-wrong-for-options,n8n-nodes-base/node-param-collection-type-unsorted-items */
import * as datatypes from '../../../../protobuf/olvid/daemon/datatypes/v1/datatypes';
import { type IDisplayOptions, type INodeProperties, updateDisplayOptions} from 'n8n-workflow';
import {contactIdPicker} from "../../../../common-properties/contactIdPicker";
import {discussionIdPicker} from "../../../../common-properties/discussionIdPicker";

const parameters: INodeProperties[] = [
	{
		displayName: 'Message filters',
		name: 'messageFilters',
		type: 'collection',
		default: {},
		description: 'Advanced filters to specify which messages should trigger the workflow',
		options: [
			{
				displayName: 'Body Search (Regex)',
				name: 'bodySearch',
				type: 'string',
				default: '',
				placeholder: 'hello|@.*',
				hint: 'Filter messages containing this text/regex pattern',
				description:
					'Use regular expressions to filter messages by content (e.g., "hello" or "^@.*" for messages starting with @)',
			},
			{
				...contactIdPicker,
				displayName: 'By a specific Contact',
				description: 'Filter messages from a specific contact ID (0 = any contact)'
			},
			{
				...discussionIdPicker,
				displayName: 'In a specific Discussion',
				description: 'Filter messages from a specific discussion ID (0 = any discussion)',
			},
			{
				displayName: 'Has Attachments',
				name: 'hasAttachments',
				type: 'options',
				options: [
					{ name: 'Any', value: datatypes.MessageFilter_Attachment.UNSPECIFIED.valueOf() },
					{ name: 'Has attachments', value: datatypes.MessageFilter_Attachment.HAVE.valueOf() },
					{ name: 'No attachments', value: datatypes.MessageFilter_Attachment.HAVE_NOT.valueOf() },
				],
				default: datatypes.MessageFilter_Attachment.UNSPECIFIED.valueOf(),
				description: 'Filter by presence of attachments',
			},
			{
				displayName: 'Has Location',
				name: 'hasLocation',
				type: 'options',
				options: [
					{ name: 'Any', value: datatypes.MessageFilter_Location.UNSPECIFIED.valueOf() },
					{ name: 'Has location', value: datatypes.MessageFilter_Location.HAVE.valueOf() },
					{ name: 'Is location send', value: datatypes.MessageFilter_Location.IS_SEND.valueOf() },
					{ name: 'Is sharing location', value: datatypes.MessageFilter_Location.IS_SHARING.valueOf() },
					{ name: 'Location sharing finished', value: datatypes.MessageFilter_Location.IS_SHARING_FINISHED.valueOf() },
					{ name: 'No location', value: datatypes.MessageFilter_Location.HAVE_NOT.valueOf() },
				],
				default: datatypes.MessageFilter_Location.UNSPECIFIED.valueOf(),
				description: 'Filter by location information',
			},
		],
	},
]

const displayOptions: IDisplayOptions = {
	show: {
		updates: ['messageReceived'],
	},
};

export const messageReceivedParameters = updateDisplayOptions(displayOptions, parameters);
