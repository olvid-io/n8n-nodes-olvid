import { Icon, ICredentialType, INodeProperties } from 'n8n-workflow';

export class OlvidApi implements ICredentialType {
	name = 'olvidApi';
	displayName = 'Olvid API';
	documentationUrl = 'https://doc.bot.olvid.io/';
	icon = 'file:../nodes/Olvid/olvid.svg' as Icon;
	properties: INodeProperties[] = [
		{
			displayName: 'Olvid client key',
			name: 'clientKey',
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
	// Currently cannot test connection because gRPC server only handle HTTP2 requests and n8n cannot parse the error message returned by server.
	// test: ICredentialTestRequest = {
	// 	request: {
	// 		method: 'GET',
	// 		url: "={{$credentials.daemonEndpoint}}/olvid.daemon.command.v1.IdentityCommandService/IdentityGet",
	// 	},
	// };
}
