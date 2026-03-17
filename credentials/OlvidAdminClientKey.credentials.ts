import { Icon, ICredentialType, INodeProperties } from 'n8n-workflow';

// eslint-disable-next-line n8n-nodes-base/cred-class-name-unsuffixed
export class OlvidAdminClientKey implements ICredentialType {
	// eslint-disable-next-line n8n-nodes-base/cred-class-field-name-unsuffixed
	name = 'olvidAdminClientKey';
	// eslint-disable-next-line n8n-nodes-base/cred-class-field-display-name-missing-api
	displayName = 'Olvid Admin Client Key';
	documentationUrl = 'https://doc.bot.olvid.io/n8n';
	icon = 'file:../nodes/Olvid/olvid.svg' as Icon;
	properties: INodeProperties[] = [
		{
			displayName: 'Admin Client Key',
			name: 'adminClientKey',
			type: 'string',
			default: '',
			required: true,
		},
		{
			displayName: 'Daemon Url',
			name: 'daemonUrl',
			type: 'string',
			default: 'http://localhost:50051',
			hint: 'Url to access your daemon instance (e.g. http://localhost:50051)',
			placeholder: 'http://localhost:50051',
			required: true,
		},
	];
}
