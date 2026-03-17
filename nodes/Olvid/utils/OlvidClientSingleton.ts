import { OlvidAdminClient } from '../client/OlvidAdminClient';
import { OlvidClient } from '../client/OlvidClient';

// TODO move somewhere else in files
// use a singleton to mutualize connections to daemon
export class OlvidClientSingleton {
	private static clientMap: {
		[endpoint: string]: { [key: string]: OlvidClient };
	} = {};
	private static adminClientMap: {
		[endpoint: string]: { [key: string]: OlvidAdminClient };
	} = {};

	static getInstance(credentials: {
		clientKey: string;
		daemonUrl: string;
	}): OlvidClient {
		if (!this.clientMap[credentials.daemonUrl]) {
			this.clientMap[credentials.daemonUrl] = {};
		}
		if (credentials.clientKey) {
			if (!this.clientMap[credentials.daemonUrl][credentials.clientKey]) {
				this.clientMap[credentials.daemonUrl][credentials.clientKey] =
					new OlvidClient(credentials.daemonUrl, credentials.clientKey);
			}
			return this.clientMap[credentials.daemonUrl][credentials.clientKey];
		}
		throw new Error(
			`OlvidClientSingleton.: invalid credentials passed: ${credentials}`,
		);
	}

	static getAdminInstance(credentials: {
		adminClientKey: string;
		daemonUrl: string;
	}): OlvidAdminClient {
		if (!this.adminClientMap[credentials.daemonUrl]) {
			this.adminClientMap[credentials.daemonUrl] = {};
		}
		if (credentials.adminClientKey) {
			if (!this.adminClientMap[credentials.daemonUrl][credentials.adminClientKey]) {
				this.adminClientMap[credentials.daemonUrl][credentials.adminClientKey] = new OlvidAdminClient(
						credentials.daemonUrl,
						credentials.adminClientKey,
					);
			}
			return this.adminClientMap[credentials.daemonUrl][
				credentials.adminClientKey
			];
		}
		throw new Error(
			`OlvidClientSingleton: invalid admin credentials passed: ${credentials}`,
		);
	}
}
