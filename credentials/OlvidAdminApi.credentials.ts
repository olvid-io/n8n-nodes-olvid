import { Icon, ICredentialType, INodeProperties } from 'n8n-workflow';

export class OlvidAdminApi implements ICredentialType {
	name = 'olvidAdminApi';
	displayName = 'Olvid Admin API';
	documentationUrl = 'https://doc.bot.olvid.io/';
	icon = 'file:../nodes/Olvid/olvid.svg' as Icon;
	properties: INodeProperties[] = [
		{
			displayName: 'Olvid admin client key',
			name: 'adminClientKey',
			type: 'string',
			default: '',
			required: true,
		},
		{
			displayName: 'Daemon Endpoint',
			name: 'daemonEndpoint',
			type: 'string',
			default: 'http://localhost:50051',
			hint: 'The endpoint of the Olvid daemon (e.g. http://localhost:50051)',
			placeholder: 'http://localhost:50051',
			required: true,
		}
	];
}
