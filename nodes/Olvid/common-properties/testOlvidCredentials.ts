import {
	ICredentialsDecrypted,
	ICredentialTestFunctions,
	INodeCredentialTestResult,
} from 'n8n-workflow';
import { OlvidClientSingleton } from '../utils/OlvidClientSingleton';

export async function testOlvidClientKey(
	this: ICredentialTestFunctions,
	credential: ICredentialsDecrypted,
): Promise<INodeCredentialTestResult> {
	const credentials: { clientKey: string; daemonUrl: string } =
		credential.data as any;
	try {
		const client = OlvidClientSingleton.getInstance(credentials);
		await client.ping();
		await client.authenticationTest();
	} catch (error) {
		return { status: 'Error', message: error.message };
	}
	return { status: 'OK', message: 'Successfully connected to Olvid Daemon.' };
}

export async function testOlvidAdminClientKey(
	this: ICredentialTestFunctions,
	credential: ICredentialsDecrypted,
): Promise<INodeCredentialTestResult> {
	const credentials: { adminClientKey: string; daemonUrl: string } =
		credential.data as any;
	try {
		const adminClient = OlvidClientSingleton.getAdminInstance(credentials);
		await adminClient.ping();
		await adminClient.authenticationAdminTest();
	} catch (error) {
		return { status: 'Error', message: error.message };
	}
	return { status: 'OK', message: 'Successfully connected to Olvid Daemon.' };
}
