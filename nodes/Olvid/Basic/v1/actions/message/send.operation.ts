import { type INodeProperties, updateDisplayOptions } from 'n8n-workflow';

import { discussionIdPicker } from '../../../../common-properties/discussionIdPicker';
import { createDurationPropertyOptions } from '../../../../common-properties/duration';

const parameters: INodeProperties[] = [
    // # Discussion id
    {
        ...discussionIdPicker,
        required: true,
    },

    // # MessageText
    {
        displayName: 'Text',
        name: 'body',
        type: 'string',
        default: '',
        description: 'Text of the message to be sent',
    },

    // # MessageFile
    {
        displayName: 'Files',
        name: "files",
        type: 'fixedCollection',
        placeholder: 'Add Files',
        typeOptions: {
            multipleValues: true,
        },
        default: [],
        options: [
            {
                displayName: 'Values',
                name: 'values',
                values: [
                    {
                        displayName: 'Use Base64 Data',
                        name: 'isBase64',
                        type: 'boolean',
                        default: false,
                    },
                    {
                        displayName: 'File Name',
                        name: 'fileName',
                        type: 'string',
                        default: 'file.txt',
                        description: 'The name of the file being sent with the message',
                        placeholder: 'e.g. file.txt',
                        hint: 'The name of the file being sent with the message',
                        displayOptions: { show: { isBase64: [true] } },
                    },
                    {
                        displayName: 'File Data',
                        name: 'fileData',
                        type: 'string',
                        default: 'data',
                        description: 'The data of the file being sent with the message',
                        placeholder: 'e.g. data',
                        hint: 'The data of the file being sent with the message',
                        displayOptions: { show: { isBase64: [true] } },
                    },
                    {
                        displayName: 'Input Binary Field',
                        name: 'binaryPropertyName',
                        type: 'string',
                        default: 'data',
                        required: true,
                        placeholder: 'e.g. data',
                        hint: 'The name of the input binary field(s) containing the file(s) to decompress',
                        description: 'The name of the file being sent with the message',
                        displayOptions: { show: { isBase64: [false] } },
                    },
                ],
            },
        ],
    },

    //* -- Additional Fields --
    {
        displayName: 'Additional Fields',
        name: 'additionalFields',
        type: 'collection',
        placeholder: 'Add Field',
        default: {},
        options: [
            // # MessageReadOnce
            {
                displayName: 'Read Once',
                name: 'readOnce',
                type: 'boolean',
                default: false,
            },
            createDurationPropertyOptions({
                displayName: 'Existence duration',
                name: 'existenceDuration',
                description: 'This message will only exist for the specified duration',
                defaultValue: { mode: 'seconds', value: 20 },
            }),
            createDurationPropertyOptions({
                displayName: 'Visibility Duration',
                name: 'visibilityDuration',
                description: 'This message will only be visible for the specified duration',
                defaultValue: { mode: 'seconds', value: 20 },
            }),
						{
							displayName: 'ReplyId',
							name: 'replyId',
							type: 'collection',
							default: {},
							options: [
								{
									displayName: 'Type',
									name: 'type',
									type: 'options',
									options: [
										{
											name: 'TYPE_UNSPECIFIED',
											value: 0
										},
										{
											name: 'TYPE_INBOUND',
											value: 1
										},
										{
											name: 'TYPE_OUTBOUND',
											value: 2
										}
									],
									default: 0
								},
								{
									displayName: 'ID',
									name: 'id',
									type: 'number',
									default: 0
								}
							],
            },
            {
                displayName: 'Disable Link Preview',
                name: 'disableLinkPreview',
                type: 'boolean',
                default: false,
                description: 'Disable link preview for this message',
            }
        ],
    },
];

const displayOptions = {
    show: {
        resource: ['message'],
        operation: ['send'],
    },
};

export const sendParameters = updateDisplayOptions(displayOptions, parameters);
