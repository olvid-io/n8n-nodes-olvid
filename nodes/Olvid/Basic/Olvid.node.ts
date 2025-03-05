import type { INodeTypeBaseDescription, IVersionedNodeType } from 'n8n-workflow';
import { VersionedNodeType } from 'n8n-workflow';

import { OlvidV1 } from './v1/OlvidV1.node';

export class Olvid extends VersionedNodeType {
    constructor() {
        const baseDescription: INodeTypeBaseDescription = {
            displayName: 'Olvid',
            name: 'olvid',
            icon: 'file:olvid.svg',
            group: ['output'],
            subtitle: '={{$parameter["operation"]}}',
            description: 'Sends data to Olvid',
            defaultVersion: 1,
        };

        const nodeVersions: IVersionedNodeType['nodeVersions'] = {
            1: new OlvidV1(baseDescription),
        };

        super(nodeVersions, baseDescription);
    }
}
