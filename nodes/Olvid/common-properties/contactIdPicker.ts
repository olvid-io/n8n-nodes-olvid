import { ILoadOptionsFunctions, INodeListSearchResult, INodeProperties } from 'n8n-workflow';
import { OlvidClientSingleton } from '../utils/OlvidClientSingleton';
import * as datatypes from '../protobuf/olvid/daemon/datatypes/v1/datatypes';

export async function contactSearch(this: ILoadOptionsFunctions): Promise<INodeListSearchResult> {
	const credentials = (await this.getCredentials('olvidApi')) as {
		clientKey: string;
		daemonEndpoint: string;
	};
	const client = OlvidClientSingleton.getInstance(credentials);
	const contacts: datatypes.Contact[] = [];
	for await (const contact of client.contactList()) contacts.push(contact);

	return {
		results: contacts.map((c) => ({
			name: c.displayName,
			value: Number(c.id),
		})),
	};
}

export const contactIdPicker: INodeProperties =
	// # Discussion
	{
		displayName: 'Contact',
		name: 'contactPicker',
		type: 'resourceLocator',
		default: { mode: 'list', value: '' },
		description: 'Select the contact by name or ID',
		modes: [
			{
				displayName: 'By Name',
				name: 'list',
				type: 'list',
				placeholder: 'e.g. Alice',
				typeOptions: {
					searchListMethod: 'contactSearch',
				},
			},
			{
				displayName: 'By ID',
				name: 'id',
				type: 'string',
				placeholder: 'e.g. 1',
				validation: [
					{
						type: 'regex',
						properties: {
							regex: '[0-9]+',
							errorMessage: 'Not a valid Olvid Contact ID',
						},
					},
				],
			},
		],
	};
