import type { INodeTypeBaseDescription, IVersionedNodeType } from 'n8n-workflow';
import { VersionedNodeType } from 'n8n-workflow';

import { OlvidAdvancedV1 } from './v1/OlvidAdvancedV1.node';

export class OlvidAdvanced extends VersionedNodeType {
    constructor() {
        const baseDescription: INodeTypeBaseDescription = {
            displayName: 'OlvidAdvanced',
            name: 'olvidAdvanced',
            icon: 'file:olvid.svg',
            group: ['output'],
            subtitle: '={{$parameter["operation"]}}',
            description: 'Sends data to Olvid',
            defaultVersion: 1,
        };

        const nodeVersions: IVersionedNodeType['nodeVersions'] = {
            1: new OlvidAdvancedV1(baseDescription),
        };

        super(nodeVersions, baseDescription);
    }
}
