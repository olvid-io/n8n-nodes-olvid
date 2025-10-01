import {OlvidAdminClient} from "../client/OlvidAdminClient";
import {OlvidClient} from "../client/OlvidClient";

// TODO move somewhere else in files
// use a singleton to mutualize connections to daemon
export class OlvidClientSingleton {
	private static clientMap: { [endpoint: string]: { [key: string]: OlvidClient} } = {};
	private static adminClientMap: { [endpoint: string]: { [key: string]: OlvidAdminClient} } = {};

	static getInstance(credentials: {clientKey: string, daemonEndpoint: string}): OlvidClient {
		if (!this.clientMap[credentials.daemonEndpoint]) {
			this.clientMap[credentials.daemonEndpoint] = {};
		}
		if (credentials.clientKey) {
			if (!this.clientMap[credentials.daemonEndpoint][credentials.clientKey]) {
				this.clientMap[credentials.daemonEndpoint][credentials.clientKey] = new OlvidClient(credentials.daemonEndpoint, credentials.clientKey);
			}
			return this.clientMap[credentials.daemonEndpoint][credentials.clientKey];
		}
		throw new Error(`OlvidClientSingleton.: invalid credentials passed: ${credentials}`)
	}

	static getAdminInstance(credentials: {adminClientKey: string, daemonEndpoint: string}): OlvidAdminClient {
		if (!this.adminClientMap[credentials.daemonEndpoint]) {
			this.adminClientMap[credentials.daemonEndpoint] = {};
		}
		if (credentials.adminClientKey) {
			if (!this.adminClientMap[credentials.daemonEndpoint][credentials.adminClientKey]) {
				this.adminClientMap[credentials.daemonEndpoint][credentials.adminClientKey] = new OlvidAdminClient(credentials.daemonEndpoint, credentials.adminClientKey);
			}
			return this.adminClientMap[credentials.daemonEndpoint][credentials.adminClientKey];
		}
		throw new Error(`OlvidClientSingleton: invalid admin credentials passed: ${credentials}`)
	}
}
