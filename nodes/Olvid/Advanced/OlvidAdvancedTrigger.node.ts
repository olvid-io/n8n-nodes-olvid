import { INodeTypeBaseDescription, IVersionedNodeType, VersionedNodeType } from 'n8n-workflow';
import { OlvidAdvancedTriggerV1 } from './v1/OlvidAdvancedTriggerV1.node';

export class OlvidAdvancedTrigger extends VersionedNodeType {
    constructor() {
        const baseDescription: INodeTypeBaseDescription = {
            displayName: 'OlvidAdvanced Trigger',
            name: 'olvidAdvancedTrigger',
            icon: 'file:olvid.svg',
            group: ['trigger'],
            subtitle: '={{$parameter["updates"].join(", ")}}',
            description: 'Start the workflow on Olvid event',
            defaultVersion: 1,
        };

        const nodeVersions: IVersionedNodeType['nodeVersions'] = {
            1: new OlvidAdvancedTriggerV1(baseDescription),
        };

        super(nodeVersions, baseDescription);
    }
}
