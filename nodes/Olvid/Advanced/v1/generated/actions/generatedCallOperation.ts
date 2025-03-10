// @generated by protoc-gen-n8n-actions v1 with parameter "target=ts"
import type { IExecuteFunctions, IDataObject, INodeExecutionData } from 'n8n-workflow';

import * as IdentityCommandService from './IdentityCommandService';
import * as InvitationCommandService from './InvitationCommandService';
import * as ContactCommandService from './ContactCommandService';
import * as KeycloakCommandService from './KeycloakCommandService';
import * as GroupCommandService from './GroupCommandService';
import * as DiscussionCommandService from './DiscussionCommandService';
import * as MessageCommandService from './MessageCommandService';
import * as AttachmentCommandService from './AttachmentCommandService';
import * as StorageCommandService from './StorageCommandService';
import * as DiscussionStorageCommandService from './DiscussionStorageCommandService';

import type { Olvid } from './generatedInterfaces';
import { OlvidClient } from '@olvid/bot-node';

export async function callOperation(this: IExecuteFunctions, i: number, client: OlvidClient, olvid: Olvid): Promise<IDataObject | IDataObject[]> {
    switch (olvid.resource) {
        case 'IdentityCommandService': {
            return await IdentityCommandService[olvid.operation].execute.call(this, i, client);
        }
        case 'InvitationCommandService': {
            return await InvitationCommandService[olvid.operation].execute.call(this, i, client);
        }
        case 'ContactCommandService': {
            return await ContactCommandService[olvid.operation].execute.call(this, i, client);
        }
        case 'KeycloakCommandService': {
            return await KeycloakCommandService[olvid.operation].execute.call(this, i, client);
        }
        case 'GroupCommandService': {
            return await GroupCommandService[olvid.operation].execute.call(this, i, client);
        }
        case 'DiscussionCommandService': {
            return await DiscussionCommandService[olvid.operation].execute.call(this, i, client);
        }
        case 'MessageCommandService': {
            return await MessageCommandService[olvid.operation].execute.call(this, i, client);
        }
        case 'AttachmentCommandService': {
            return await AttachmentCommandService[olvid.operation].execute.call(this, i, client);
        }
        case 'StorageCommandService': {
            return await StorageCommandService[olvid.operation].execute.call(this, i, client);
        }
        case 'DiscussionStorageCommandService': {
            return await DiscussionStorageCommandService[olvid.operation].execute.call(this, i, client);
        }
        default: throw new Error(`The resource is not known!`);
    }
}
