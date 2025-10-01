import { ICredentialsDecrypted, ICredentialTestFunctions, INodeCredentialTestResult } from "n8n-workflow";
import {OlvidClientSingleton} from "../utils/OlvidClientSingleton";

//! See https://github.com/n8n-io/n8n/issues/8188

export async function testOlvidCredentials(
    this: ICredentialTestFunctions, credential: ICredentialsDecrypted
): Promise<INodeCredentialTestResult> {
    const credentials: { clientKey: string, daemonEndpoint: string } = credential.data as any;
    try {
				const client = OlvidClientSingleton.getInstance(credentials);
				// TODO use ping entrypoint
				await client.identityGet({})
    } catch (error) {
        return { status: 'Error', message: error.message };
    }
    return { status: 'OK', message: 'Successfully connected to Olvid Daemon.' };
}

// TODO implements for admin credentials
