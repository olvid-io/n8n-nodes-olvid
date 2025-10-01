// Copied from: ../overrides/identitySetPhoto.operation.ts
import { type INodeProperties, updateDisplayOptions } from 'n8n-workflow';

const properties: INodeProperties[] = [
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
		resource: ['IdentityCommandService'],
		operation: ['IdentitySetPhoto'],
	},
};

export const identitySetPhotoProperties = updateDisplayOptions(displayOptions, properties);

