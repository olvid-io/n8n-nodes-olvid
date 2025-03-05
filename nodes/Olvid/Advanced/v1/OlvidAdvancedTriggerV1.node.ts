import { INodeType, INodeTypeBaseDescription, INodeTypeDescription, ITriggerFunctions, ITriggerResponse } from 'n8n-workflow';

import { versionDescription } from './triggers/versionDescription';
import { router } from './triggers/router';
import { testOlvidDaemon } from '../../common-methods/testOlvidDaemon';

export class OlvidAdvancedTriggerV1 implements INodeType {
    description: INodeTypeDescription;

    constructor(baseDescription: INodeTypeBaseDescription) {
        this.description = {
            ...baseDescription,
            ...versionDescription,
        }
    }

    methods = { credentialTest: { testOlvidDaemon } };

    async trigger(this: ITriggerFunctions): Promise<ITriggerResponse> {
        return await router.call(this);
    }
}
