// Copied from: ../overrides/messageSendWithAttachments.operation.ts
/* eslint-disable n8n-nodes-base/node-param-required-false */
import { type INodeProperties, updateDisplayOptions } from 'n8n-workflow';

// @ts-ignore
import { messageSendProperties } from './messageSend.operation';

const properties: INodeProperties[] = [
		// import message send properties to stay up to date, considering we have the same parameters except files
		...messageSendProperties,
		{
        displayName: 'Files',
        name: 'files',
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
                        displayName: 'Use base64 data',
                        name: 'isBase64',
                        type: 'boolean',
                        default: false,
                        description: 'If the file data is base64 encoded',
                    },
                    {
                        displayName: 'File name',
                        name: 'fileName',
                        type: 'string',
                        default: 'file.txt',
                        description: 'The name of the file being sent with the message',
                        placeholder: 'e.g. file.txt',
                        hint: 'The name of the file being sent with the message',
                        displayOptions: { show: { isBase64: [true] } },
                    },
                    {
                        displayName: 'File data',
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
];

// override body parameter to make it not required
properties.forEach(property => {
	if (property.name === 'body') {
		property.required = false;
	}
})

const displayOptions = {
    show: {
        resource: ['MessageCommandService'],
        operation: ['MessageSendWithAttachments'],
    },
};

export const messageSendWithAttachmentsProperties = updateDisplayOptions(displayOptions, properties);

