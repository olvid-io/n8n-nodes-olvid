// @generated by protoc-gen-n8n-actions v1 with parameter "target=ts"
// @generated from file olvid/daemon/services/v1/command_service.proto (package olvid.daemon.services.v1, syntax proto3)
/* eslint-disable */

import { type IExecuteFunctions, type INodeExecutionData, type IDataObject, type INodeProperties, updateDisplayOptions } from 'n8n-workflow';

// noinspection ES6UnusedImports
import { datatypes, OlvidClient, commands } from '@olvid/bot-node';

const properties: INodeProperties[] = [
  {
    displayName: 'Name',
    name: 'name',
    type: 'string',
    required: false,

    default: '',
  },
  {
    displayName: 'Description',
    name: 'description',
    type: 'string',
    required: false,

    default: '',
  },
  {
    displayName: 'AdvancedConfiguration',
    name: 'advancedConfiguration',
    type: 'collection',
    default: {
    },
    options: [
      {
        displayName: 'AdvancedConfiguration | ReadOnly',
        name: 'readOnly',
        type: 'boolean',


        default: false,
      },
      {
        displayName: 'AdvancedConfiguration | RemoteDelete',
        name: 'remoteDelete',
        type: 'options',

        options: [
          { name: 'REMOTE_DELETE_UNSPECIFIED', value: 'REMOTE_DELETE_UNSPECIFIED' },
          { name: 'REMOTE_DELETE_NOBODY', value: 'REMOTE_DELETE_NOBODY' },
          { name: 'REMOTE_DELETE_ADMINS', value: 'REMOTE_DELETE_ADMINS' },
          { name: 'REMOTE_DELETE_EVERYONE', value: 'REMOTE_DELETE_EVERYONE' },
        ],
        default: 'REMOTE_DELETE_UNSPECIFIED',
      },
    ],
  },
  {
    displayName: 'Members  - List',
    name: 'membersList',
    type: 'fixedCollection',
    typeOptions: {
      multipleValues: true,
    },
    default: {},
    options: [
      {
        name: 'collection',
        displayName: 'Collection',
        values: [
          {
            displayName: 'Members',
            name: 'members',
            type: 'collection',
            default: {
              contactId: 0,
              permissions: '',
            },
            options: [
              {
                displayName: 'Members | ContactId',
                name: 'contactId',
                type: 'number',


                default: 0,
              },
              {
                displayName: 'Members | Permissions',
                name: 'permissions',
                type: 'collection',
                default: {
                  admin: false,
                  remoteDeleteAnything: false,
                  editOrRemoteDeleteOwnMessages: false,
                  changeSettings: false,
                  sendMessage: false,
                },
                options: [
                  {
                    displayName: 'Members | Permissions| Admin',
                    name: 'admin',
                    type: 'boolean',


                    default: false,
                  },
                  {
                    displayName: 'Members | Permissions| RemoteDeleteAnything',
                    name: 'remoteDeleteAnything',
                    type: 'boolean',


                    default: false,
                  },
                  {
                    displayName: 'Members | Permissions| EditOrRemoteDeleteOwnMessages',
                    name: 'editOrRemoteDeleteOwnMessages',
                    type: 'boolean',


                    default: false,
                  },
                  {
                    displayName: 'Members | Permissions| ChangeSettings',
                    name: 'changeSettings',
                    type: 'boolean',


                    default: false,
                  },
                  {
                    displayName: 'Members | Permissions| SendMessage',
                    name: 'sendMessage',
                    type: 'boolean',


                    default: false,
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
];

const displayOptions = {
  show: {
    resource: ['GroupCommandService'],
    operation: ['GroupNewAdvancedGroup'],
  },
};

export const description = updateDisplayOptions(displayOptions, properties);

export async function execute(this: IExecuteFunctions, index: number, client: OlvidClient): Promise<INodeExecutionData[]> {
    const name: string | undefined = this.getNodeParameter('name', index) ? this.getNodeParameter('name', index) as string : undefined;
    const description: string | undefined = this.getNodeParameter('description', index) ? this.getNodeParameter('description', index) as string : undefined;
    function getAdvancedConfiguration(this: IExecuteFunctions, index: number): datatypes.Group_AdvancedConfiguration | undefined {
        const itemAdvancedConfiguration = this.getNodeParameter('advancedConfiguration', index) as IDataObject | undefined;
        if (itemAdvancedConfiguration === undefined) {
            return undefined;
        }
        const readOnly: boolean | undefined = itemAdvancedConfiguration['readOnly'] ? itemAdvancedConfiguration['readOnly'] as boolean : undefined;
        function getRemoteDelete(this: IExecuteFunctions, itemAdvancedConfiguration: IDataObject): datatypes.Group_AdvancedConfiguration_RemoteDelete | undefined {
            const value: string | number | undefined = itemAdvancedConfiguration['remoteDelete'] as string | number | undefined;
            if (value === undefined) {
                return undefined;
            }
            if (typeof value == 'number') {
                if (datatypes.Group_AdvancedConfiguration_RemoteDelete [value] === undefined) {
                    throw new Error('The attachment type "${value}" is not known.');
                }
                return value as datatypes.Group_AdvancedConfiguration_RemoteDelete;
            }
            else {
                const enumKey = value.replace("REMOTEDELETE_", "");
                return datatypes.Group_AdvancedConfiguration_RemoteDelete [enumKey as keyof typeof datatypes.Group_AdvancedConfiguration_RemoteDelete];
            }
        }
        const remoteDelete: datatypes.Group_AdvancedConfiguration_RemoteDelete | undefined = getRemoteDelete.call(this, itemAdvancedConfiguration);
        return new datatypes.Group_AdvancedConfiguration({
            readOnly,
            remoteDelete,
        });
    }
    const advancedConfiguration: datatypes.Group_AdvancedConfiguration | undefined = getAdvancedConfiguration.call(this, index);
    function getMembers(this: IExecuteFunctions, index: number): datatypes.GroupMember[] {
        function getMembers(this: IExecuteFunctions, itemGroupNewAdvancedGroupRequest: IDataObject): datatypes.GroupMember {
            const itemMembers = itemGroupNewAdvancedGroupRequest['members'] as IDataObject;
            const contactId: bigint = BigInt(itemMembers['contactId'] as number);
            function getPermissions(this: IExecuteFunctions, itemGroupMember: IDataObject): datatypes.GroupMemberPermissions {
                const itemPermissions = itemGroupMember['permissions'] as IDataObject;
                const admin: boolean = itemPermissions['admin'] as boolean;
                const remoteDeleteAnything: boolean = itemPermissions['remoteDeleteAnything'] as boolean;
                const editOrRemoteDeleteOwnMessages: boolean = itemPermissions['editOrRemoteDeleteOwnMessages'] as boolean;
                const changeSettings: boolean = itemPermissions['changeSettings'] as boolean;
                const sendMessage: boolean = itemPermissions['sendMessage'] as boolean;
                return new datatypes.GroupMemberPermissions({
                    admin,
                    remoteDeleteAnything,
                    editOrRemoteDeleteOwnMessages,
                    changeSettings,
                    sendMessage,
                });
            }
            const permissions: datatypes.GroupMemberPermissions = getPermissions.call(this, itemMembers);
            return new datatypes.GroupMember({
                contactId,
                permissions,
            });
        }
        const membersCollectionParent: IDataObject | undefined = this.getNodeParameter('membersList', index) as IDataObject | undefined;
        if (membersCollectionParent === undefined) {
            return [];
        }
        const membersCollection: IDataObject[] | undefined = membersCollectionParent['collection'] as IDataObject[] | undefined;
        if (membersCollection === undefined) {
            return [];
        }
        const membersList: datatypes.GroupMember[] = [];
        for (const itemMembers of membersCollection) {
            const members: datatypes.GroupMember = getMembers.call(this, itemMembers);
            membersList.push(members);
        }
        return membersList;
    }
    const members: datatypes.GroupMember[] = getMembers.call(this, index);
    const response: commands.GroupNewAdvancedGroupResponse = await client.stubs.groupCommandStub.groupNewAdvancedGroup({name, description, advancedConfiguration, members});
    return this.helpers.returnJsonArray({id: Number(response?.group?.id), type: datatypes.Group_Type[response?.group?.type ?? 0], advancedConfiguration: {readOnly: response?.group?.advancedConfiguration?.readOnly, remoteDelete: datatypes.Group_AdvancedConfiguration_RemoteDelete[response?.group?.advancedConfiguration?.remoteDelete ?? 0]}, ownPermissions: {admin: response?.group?.ownPermissions?.admin, remoteDeleteAnything: response?.group?.ownPermissions?.remoteDeleteAnything, editOrRemoteDeleteOwnMessages: response?.group?.ownPermissions?.editOrRemoteDeleteOwnMessages, changeSettings: response?.group?.ownPermissions?.changeSettings, sendMessage: response?.group?.ownPermissions?.sendMessage}, members: response?.group?.members.map(e => ({contactId: Number(e.contactId), permissions: {admin: e.permissions?.admin, remoteDeleteAnything: e.permissions?.remoteDeleteAnything, editOrRemoteDeleteOwnMessages: e.permissions?.editOrRemoteDeleteOwnMessages, changeSettings: e.permissions?.changeSettings, sendMessage: e.permissions?.sendMessage}})), pendingMembers: response?.group?.pendingMembers.map(e => ({pendingMemberId: Number(e.pendingMemberId), contactId: Number(e.contactId), displayName: e.displayName, declined: e.declined, permissions: {admin: e.permissions?.admin, remoteDeleteAnything: e.permissions?.remoteDeleteAnything, editOrRemoteDeleteOwnMessages: e.permissions?.editOrRemoteDeleteOwnMessages, changeSettings: e.permissions?.changeSettings, sendMessage: e.permissions?.sendMessage}})), updateInProgress: response?.group?.updateInProgress, keycloakManaged: response?.group?.keycloakManaged, name: response?.group?.name, description: response?.group?.description, hasAPhoto: response?.group?.hasAPhoto});
}
