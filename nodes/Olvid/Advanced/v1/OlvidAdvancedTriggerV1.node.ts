/* eslint-disable n8n-nodes-base/node-class-description-inputs-wrong-regular-node */
import {
	INodeType,
	INodeTypeBaseDescription,
	INodeTypeDescription,
	ITriggerFunctions,
	ITriggerResponse,
	NodeConnectionType,
} from 'n8n-workflow';

import { router } from './triggers/router';
import { testOlvidDaemon } from '../../common-methods/testOlvidDaemon';
import fs from 'node:fs';
import util from 'node:util';

import { generatedProperties } from './generated/triggers/generatedTriggerProperties';

export class OlvidAdvancedTriggerV1 implements INodeType {
    description: INodeTypeDescription;

    constructor(baseDescription: INodeTypeBaseDescription) {
        this.description = {
            ...baseDescription,
						displayName: 'OlvidAdvanced Trigger',
						name: 'olvidTrigger',
						group: ['trigger'],
						version: 1,
						description: 'Start the workflow on Olvid update',
						defaults: {
							name: 'OlvidAdvanced Trigger',
						},
						inputs: [],
						outputs: [NodeConnectionType.Main],
						credentials: [
							{
								name: 'olvidApi',
								required: true,
								testedBy: 'testOlvidDaemon',
							},
						],
					// most of our node properties are generated, those properties contains:
					// triggers list (ex: onMessageReceived, onMessageAdded,...)
					// trigger parameters
						properties: generatedProperties
        }
				// TODO TODEL
			fs.writeFileSync("/home/visago/Desktop/olvid/daemon/n8n/json/olvid-advanced-trigger.json", util.inspect(this.description, {depth: null}));
    }

    methods = { credentialTest: { testOlvidDaemon } };

    async trigger(this: ITriggerFunctions): Promise<ITriggerResponse> {
        return await router.call(this);
    }
}
