import type { INodeTypeBaseDescription, IVersionedNodeType } from 'n8n-workflow';
import { VersionedNodeType } from 'n8n-workflow';

import { OlvidAdvancedAdminV1 } from './v1/OlvidAdvancedAdminV1.node';

export class OlvidAdvancedAdmin extends VersionedNodeType {
    constructor() {
        const baseDescription: INodeTypeBaseDescription = {
            displayName: 'OlvidAdvancedAdmin',
            name: 'olvidAdvancedAdmin',
            icon: 'file:olvid.svg',
            group: ['output'],
            subtitle: '={{$parameter["operation"]}}',
            description: 'Sends data to Olvid',
            defaultVersion: 1,
        };

        const nodeVersions: IVersionedNodeType['nodeVersions'] = {
            1: new OlvidAdvancedAdminV1(baseDescription),
        };

        super(nodeVersions, baseDescription);
    }
}
