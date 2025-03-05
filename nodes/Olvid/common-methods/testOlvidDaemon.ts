import { OlvidClient } from "@olvid/bot-node";
import { ICredentialsDecrypted, ICredentialTestFunctions, INodeCredentialTestResult } from "n8n-workflow";

//! See https://github.com/n8n-io/n8n/issues/8188

export async function testOlvidDaemon(
    this: ICredentialTestFunctions, credential: ICredentialsDecrypted
): Promise<INodeCredentialTestResult> {
    const credentials: { clientKey: string, daemonEndpoint: string } = credential.data as any;
    try {
        const client = new OlvidClient({
            serverUrl: credentials.daemonEndpoint,
            clientKey: credentials.clientKey,
        });
				await client.identityGet({})
    } catch (error) {
        return { status: 'Error', message: error.message };
    }
    return { status: 'OK', message: 'Successfully connected to Olvid Daemon.' };
}
