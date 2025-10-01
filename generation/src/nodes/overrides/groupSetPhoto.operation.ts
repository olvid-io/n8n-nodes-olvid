import { type INodeProperties, updateDisplayOptions } from 'n8n-workflow';


const properties: INodeProperties[] = [
	{
		displayName: 'GroupId',
		name: 'groupId',
		type: 'number',
		required: true,
		default: 0,
	},
	{
		displayName: 'Binary Property Name',
		name: 'binaryPropertyName',
		type: 'string',
		required: true,
		default: 'data',
	},
];

const displayOptions = {
	show: {
		resource: ['GroupCommandService'],
		operation: ['GroupSetPhoto'],
	},
};

export const groupSetPhotoProperties = updateDisplayOptions(displayOptions, properties);
