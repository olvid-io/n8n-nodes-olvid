import { ILoadOptionsFunctions, INodeListSearchResult, INodeProperties } from 'n8n-workflow';
import { OlvidClientSingleton } from '../utils/OlvidClientSingleton';
import * as datatypes from '../protobuf/olvid/daemon/datatypes/v1/datatypes';

export async function discussionSearch(
	this: ILoadOptionsFunctions,
): Promise<INodeListSearchResult> {
	const credentials = (await this.getCredentials('olvidApi')) as {
		clientKey: string;
		daemonEndpoint: string;
	};
	const client = OlvidClientSingleton.getInstance(credentials);
	const discussions: datatypes.Discussion[] = [];
	for await (const discussion of client.discussionList()) discussions.push(discussion);

	return {
		results: discussions.map((discussion) => ({
			name: discussion.title,
			value: Number(discussion.id),
		})),
	};
}

export const discussionIdPicker: INodeProperties =
	// # Discussion
	{
		displayName: 'Discussion',
		name: 'discussionPicker',
		type: 'resourceLocator',
		default: { mode: 'list', value: '' },
		description: 'Select the discussion by name or ID',
		modes: [
			{
				displayName: 'By Name',
				name: 'list',
				type: 'list',
				placeholder: 'e.g. Alice',
				typeOptions: {
					searchListMethod: 'discussionSearch',
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
							errorMessage: 'Not a valid Olvid Discussion ID',
						},
					},
				],
			},
		],
	};
