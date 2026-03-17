import { Icon, ICredentialType, INodeProperties } from 'n8n-workflow';

// eslint-disable-next-line n8n-nodes-base/cred-class-name-unsuffixed
export class OlvidClientKey implements ICredentialType {
	// eslint-disable-next-line n8n-nodes-base/cred-class-field-name-unsuffixed
	name = 'olvidClientKey';
	// eslint-disable-next-line n8n-nodes-base/cred-class-field-display-name-missing-api
	displayName = 'Olvid Client Key';
	documentationUrl = 'https://doc.bot.olvid.io/n8n';
	icon = 'file:../nodes/Olvid/olvid.svg' as Icon;
	properties: INodeProperties[] = [
		{
			displayName: 'Client Key',
			name: 'clientKey',
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
	// Currently cannot test connection because gRPC server only handle HTTP2 requests and n8n cannot parse the error message returned by server.
	// test: ICredentialTestRequest = {
	// 	request: {
	// 		method: 'GET',
	// 		url: "={{$credentials.daemonUrl}}/olvid.daemon.command.v1.IdentityCommandService/IdentityGet",
	// 	},
	// };
}
