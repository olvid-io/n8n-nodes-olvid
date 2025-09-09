import type {
    IExecuteFunctions,
    INodeExecutionData,
    INodeType,
    INodeTypeBaseDescription,
    INodeTypeDescription,
} from 'n8n-workflow';

import { listSearch } from './methods';

import { router } from './actions/router';

import { versionDescription } from './actions/versionDescription';
import { testOlvidDaemon } from '../../common-methods/testOlvidDaemon';
import fs from 'node:fs';
import util from 'node:util';

export class OlvidAdvancedV1 implements INodeType {
    description: INodeTypeDescription;

    constructor(baseDescription: INodeTypeBaseDescription) {
        this.description = {
            ...baseDescription,
            ...versionDescription,
        };
			// TODO TODEL
			fs.writeFileSync("/home/visago/Desktop/olvid/daemon/n8n/json/olvid-advanced-action.json", util.inspect(this.description, {depth: null}));
		}

    methods = { listSearch, credentialTest: { testOlvidDaemon } };

    async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
        return await router.call(this);
    }
}
