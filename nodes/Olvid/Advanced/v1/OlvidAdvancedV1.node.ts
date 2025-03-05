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

export class OlvidAdvancedV1 implements INodeType {
    description: INodeTypeDescription;

    constructor(baseDescription: INodeTypeBaseDescription) {
        this.description = {
            ...baseDescription,
            ...versionDescription,
        };
    }

    methods = { listSearch, credentialTest: { testOlvidDaemon } };

    async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
        return await router.call(this);
    }
}
