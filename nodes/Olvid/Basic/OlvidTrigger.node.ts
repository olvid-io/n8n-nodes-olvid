import { INodeTypeBaseDescription, IVersionedNodeType, VersionedNodeType } from 'n8n-workflow';
import { OlvidTriggerV1 } from './v1/OlvidTriggerV1.node';

export class OlvidTrigger extends VersionedNodeType {
    constructor() {
        const baseDescription: INodeTypeBaseDescription = {
            displayName: 'Olvid Trigger',
            name: 'olvidTrigger',
            icon: 'file:olvid.svg',
            group: ['trigger'],
            subtitle: '={{$parameter["updates"].join(", ")}}',
            description: 'Start the workflow on Olvid update',
            defaultVersion: 1,
        };

        const nodeVersions: IVersionedNodeType['nodeVersions'] = {
            1: new OlvidTriggerV1(baseDescription),
        };

        super(nodeVersions, baseDescription);
    }
}
