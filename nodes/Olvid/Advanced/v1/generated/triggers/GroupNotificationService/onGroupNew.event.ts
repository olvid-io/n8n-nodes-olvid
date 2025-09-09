/* eslint-disable n8n-nodes-base/node-param-display-name-miscased-id,n8n-nodes-base/node-param-required-false,n8n-nodes-base/node-param-collection-type-unsorted-items,n8n-nodes-base/node-param-options-type-unsorted-items */
import { OlvidClient } from '../../../../../client/OlvidClient';
// noinspection ES6UnusedImports
import * as datatypes from '../../../../../protobuf/olvid/daemon/datatypes/v1/datatypes';
// noinspection ES6UnusedImports
import * as notifications from '../../../../../protobuf/olvid/daemon/notification/v1/notification';
// noinspection ES6UnusedImports
import { type ITriggerFunctions, type IDataObject, type INodeProperties, updateDisplayOptions, replaceCircularReferences } from 'n8n-workflow';


const properties: INodeProperties[] = [
  {
    displayName: 'Count',
    name: 'count',
    type: 'number',
    required: false,

    default: 0,
  },
  {
    displayName: 'GroupFilter',
    name: 'groupFilter',
    type: 'collection',
    default: {
    },
    options: [
      {
        displayName: 'GroupFilter | Type',
        name: 'type',
        type: 'options',

        options: [
          { name: 'TYPE_UNSPECIFIED', value: 'TYPE_UNSPECIFIED' },
          { name: 'TYPE_STANDARD', value: 'TYPE_STANDARD' },
          { name: 'TYPE_CONTROLLED', value: 'TYPE_CONTROLLED' },
          { name: 'TYPE_READ_ONLY', value: 'TYPE_READ_ONLY' },
          { name: 'TYPE_ADVANCED', value: 'TYPE_ADVANCED' },
        ],
        default: 'TYPE_UNSPECIFIED',
      },
      {
        displayName: 'GroupFilter | Empty',
        name: 'empty',
        type: 'options',

        options: [
          { name: 'EMPTY_UNSPECIFIED', value: 'EMPTY_UNSPECIFIED' },
          { name: 'EMPTY_IS', value: 'EMPTY_IS' },
          { name: 'EMPTY_IS_NOT', value: 'EMPTY_IS_NOT' },
        ],
        default: 'EMPTY_UNSPECIFIED',
      },
      {
        displayName: 'GroupFilter | Photo',
        name: 'photo',
        type: 'options',

        options: [
          { name: 'PHOTO_UNSPECIFIED', value: 'PHOTO_UNSPECIFIED' },
          { name: 'PHOTO_HAS', value: 'PHOTO_HAS' },
          { name: 'PHOTO_HAS_NOT', value: 'PHOTO_HAS_NOT' },
        ],
        default: 'PHOTO_UNSPECIFIED',
      },
      {
        displayName: 'GroupFilter | Keycloak',
        name: 'keycloak',
        type: 'options',

        options: [
          { name: 'KEYCLOAK_UNSPECIFIED', value: 'KEYCLOAK_UNSPECIFIED' },
          { name: 'KEYCLOAK_IS', value: 'KEYCLOAK_IS' },
          { name: 'KEYCLOAK_IS_NOT', value: 'KEYCLOAK_IS_NOT' },
        ],
        default: 'KEYCLOAK_UNSPECIFIED',
      },
      {
        displayName: 'GroupFilter | OwnPermissionsFilter',
        name: 'ownPermissionsFilter',
        type: 'collection',
        default: {
        },
        options: [
          {
            displayName: 'GroupFilter | OwnPermissionsFilter| Admin',
            name: 'admin',
            type: 'options',

            options: [
              { name: 'ADMIN_UNSPECIFIED', value: 'ADMIN_UNSPECIFIED' },
              { name: 'ADMIN_IS', value: 'ADMIN_IS' },
              { name: 'ADMIN_IS_NOT', value: 'ADMIN_IS_NOT' },
            ],
            default: 'ADMIN_UNSPECIFIED',
          },
          {
            displayName: 'GroupFilter | OwnPermissionsFilter| SendMessage',
            name: 'sendMessage',
            type: 'options',

            options: [
              { name: 'SEND_MESSAGE_UNSPECIFIED', value: 'SEND_MESSAGE_UNSPECIFIED' },
              { name: 'SEND_MESSAGE_CAN', value: 'SEND_MESSAGE_CAN' },
              { name: 'SEND_MESSAGE_CANNOT', value: 'SEND_MESSAGE_CANNOT' },
            ],
            default: 'SEND_MESSAGE_UNSPECIFIED',
          },
          {
            displayName: 'GroupFilter | OwnPermissionsFilter| RemoteDeleteAnything',
            name: 'remoteDeleteAnything',
            type: 'options',

            options: [
              { name: 'REMOTE_DELETE_ANYTHING_UNSPECIFIED', value: 'REMOTE_DELETE_ANYTHING_UNSPECIFIED' },
              { name: 'REMOTE_DELETE_ANYTHING_CAN', value: 'REMOTE_DELETE_ANYTHING_CAN' },
              { name: 'REMOTE_DELETE_ANYTHING_CANNOT', value: 'REMOTE_DELETE_ANYTHING_CANNOT' },
            ],
            default: 'REMOTE_DELETE_ANYTHING_UNSPECIFIED',
          },
          {
            displayName: 'GroupFilter | OwnPermissionsFilter| EditOrRemoteDeleteOwnMessages',
            name: 'editOrRemoteDeleteOwnMessages',
            type: 'options',

            options: [
              { name: 'EDIT_OR_REMOTE_DELETE_OWN_MESSAGE_UNSPECIFIED', value: 'EDIT_OR_REMOTE_DELETE_OWN_MESSAGE_UNSPECIFIED' },
              { name: 'EDIT_OR_REMOTE_DELETE_OWN_MESSAGE_CAN', value: 'EDIT_OR_REMOTE_DELETE_OWN_MESSAGE_CAN' },
              { name: 'EDIT_OR_REMOTE_DELETE_OWN_MESSAGE_CANNOT', value: 'EDIT_OR_REMOTE_DELETE_OWN_MESSAGE_CANNOT' },
            ],
            default: 'EDIT_OR_REMOTE_DELETE_OWN_MESSAGE_UNSPECIFIED',
          },
          {
            displayName: 'GroupFilter | OwnPermissionsFilter| ChangeSettings',
            name: 'changeSettings',
            type: 'options',

            options: [
              { name: 'CHANGE_SETTINGS_UNSPECIFIED', value: 'CHANGE_SETTINGS_UNSPECIFIED' },
              { name: 'CHANGE_SETTINGS_CAN', value: 'CHANGE_SETTINGS_CAN' },
              { name: 'CHANGE_SETTINGS_CANNOT', value: 'CHANGE_SETTINGS_CANNOT' },
            ],
            default: 'CHANGE_SETTINGS_UNSPECIFIED',
          },
        ],
      },
      {
        displayName: 'GroupFilter | NameSearch',
        name: 'nameSearch',
        type: 'string',


        default: '',
      },
      {
        displayName: 'GroupFilter | DescriptionSearch',
        name: 'descriptionSearch',
        type: 'string',


        default: '',
      },
      {
        displayName: 'GroupFilter | MemberFilters- List',
        name: 'memberFiltersList',
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
                displayName: 'GroupFilter | MemberFilters',
                name: 'memberFilters',
                type: 'collection',
                default: {
                },
                options: [
                  {
                    displayName: 'GroupFilter | MemberFilters| ContactId',
                    name: 'contactId',
                    type: 'number',


                    default: 0,
                  },
                  {
                    displayName: 'GroupFilter | MemberFilters| Permissions',
                    name: 'permissions',
                    type: 'collection',
                    default: {
                    },
                    options: [
                      {
                        displayName: 'GroupFilter | MemberFilters| Permissions| Admin',
                        name: 'admin',
                        type: 'options',

                        options: [
                          { name: 'ADMIN_UNSPECIFIED', value: 'ADMIN_UNSPECIFIED' },
                          { name: 'ADMIN_IS', value: 'ADMIN_IS' },
                          { name: 'ADMIN_IS_NOT', value: 'ADMIN_IS_NOT' },
                        ],
                        default: 'ADMIN_UNSPECIFIED',
                      },
                      {
                        displayName: 'GroupFilter | MemberFilters| Permissions| SendMessage',
                        name: 'sendMessage',
                        type: 'options',

                        options: [
                          { name: 'SEND_MESSAGE_UNSPECIFIED', value: 'SEND_MESSAGE_UNSPECIFIED' },
                          { name: 'SEND_MESSAGE_CAN', value: 'SEND_MESSAGE_CAN' },
                          { name: 'SEND_MESSAGE_CANNOT', value: 'SEND_MESSAGE_CANNOT' },
                        ],
                        default: 'SEND_MESSAGE_UNSPECIFIED',
                      },
                      {
                        displayName: 'GroupFilter | MemberFilters| Permissions| RemoteDeleteAnything',
                        name: 'remoteDeleteAnything',
                        type: 'options',

                        options: [
                          { name: 'REMOTE_DELETE_ANYTHING_UNSPECIFIED', value: 'REMOTE_DELETE_ANYTHING_UNSPECIFIED' },
                          { name: 'REMOTE_DELETE_ANYTHING_CAN', value: 'REMOTE_DELETE_ANYTHING_CAN' },
                          { name: 'REMOTE_DELETE_ANYTHING_CANNOT', value: 'REMOTE_DELETE_ANYTHING_CANNOT' },
                        ],
                        default: 'REMOTE_DELETE_ANYTHING_UNSPECIFIED',
                      },
                      {
                        displayName: 'GroupFilter | MemberFilters| Permissions| EditOrRemoteDeleteOwnMessages',
                        name: 'editOrRemoteDeleteOwnMessages',
                        type: 'options',

                        options: [
                          { name: 'EDIT_OR_REMOTE_DELETE_OWN_MESSAGE_UNSPECIFIED', value: 'EDIT_OR_REMOTE_DELETE_OWN_MESSAGE_UNSPECIFIED' },
                          { name: 'EDIT_OR_REMOTE_DELETE_OWN_MESSAGE_CAN', value: 'EDIT_OR_REMOTE_DELETE_OWN_MESSAGE_CAN' },
                          { name: 'EDIT_OR_REMOTE_DELETE_OWN_MESSAGE_CANNOT', value: 'EDIT_OR_REMOTE_DELETE_OWN_MESSAGE_CANNOT' },
                        ],
                        default: 'EDIT_OR_REMOTE_DELETE_OWN_MESSAGE_UNSPECIFIED',
                      },
                      {
                        displayName: 'GroupFilter | MemberFilters| Permissions| ChangeSettings',
                        name: 'changeSettings',
                        type: 'options',

                        options: [
                          { name: 'CHANGE_SETTINGS_UNSPECIFIED', value: 'CHANGE_SETTINGS_UNSPECIFIED' },
                          { name: 'CHANGE_SETTINGS_CAN', value: 'CHANGE_SETTINGS_CAN' },
                          { name: 'CHANGE_SETTINGS_CANNOT', value: 'CHANGE_SETTINGS_CANNOT' },
                        ],
                        default: 'CHANGE_SETTINGS_UNSPECIFIED',
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
      {
        displayName: 'GroupFilter | PendingMemberFilters- List',
        name: 'pendingMemberFiltersList',
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
                displayName: 'GroupFilter | PendingMemberFilters',
                name: 'pendingMemberFilters',
                type: 'collection',
                default: {
                },
                options: [
                  {
                    displayName: 'GroupFilter | PendingMemberFilters| IsContact',
                    name: 'isContact',
                    type: 'options',

                    options: [
                      { name: 'CONTACT_UNSPECIFIED', value: 'CONTACT_UNSPECIFIED' },
                      { name: 'CONTACT_IS', value: 'CONTACT_IS' },
                      { name: 'CONTACT_IS_NOT', value: 'CONTACT_IS_NOT' },
                    ],
                    default: 'CONTACT_UNSPECIFIED',
                  },
                  {
                    displayName: 'GroupFilter | PendingMemberFilters| HasDeclined',
                    name: 'hasDeclined',
                    type: 'options',

                    options: [
                      { name: 'DECLINED_UNSPECIFIED', value: 'DECLINED_UNSPECIFIED' },
                      { name: 'DECLINED_HAS', value: 'DECLINED_HAS' },
                      { name: 'DECLINED_HAS_NOT', value: 'DECLINED_HAS_NOT' },
                    ],
                    default: 'DECLINED_UNSPECIFIED',
                  },
                  {
                    displayName: 'GroupFilter | PendingMemberFilters| ContactId',
                    name: 'contactId',
                    type: 'number',


                    default: 0,
                  },
                  {
                    displayName: 'GroupFilter | PendingMemberFilters| DisplayNameSearch',
                    name: 'displayNameSearch',
                    type: 'string',


                    default: '',
                  },
                  {
                    displayName: 'GroupFilter | PendingMemberFilters| Permissions',
                    name: 'permissions',
                    type: 'collection',
                    default: {
                    },
                    options: [
                      {
                        displayName: 'GroupFilter | PendingMemberFilters| Permissions| Admin',
                        name: 'admin',
                        type: 'options',

                        options: [
                          { name: 'ADMIN_UNSPECIFIED', value: 'ADMIN_UNSPECIFIED' },
                          { name: 'ADMIN_IS', value: 'ADMIN_IS' },
                          { name: 'ADMIN_IS_NOT', value: 'ADMIN_IS_NOT' },
                        ],
                        default: 'ADMIN_UNSPECIFIED',
                      },
                      {
                        displayName: 'GroupFilter | PendingMemberFilters| Permissions| SendMessage',
                        name: 'sendMessage',
                        type: 'options',

                        options: [
                          { name: 'SEND_MESSAGE_UNSPECIFIED', value: 'SEND_MESSAGE_UNSPECIFIED' },
                          { name: 'SEND_MESSAGE_CAN', value: 'SEND_MESSAGE_CAN' },
                          { name: 'SEND_MESSAGE_CANNOT', value: 'SEND_MESSAGE_CANNOT' },
                        ],
                        default: 'SEND_MESSAGE_UNSPECIFIED',
                      },
                      {
                        displayName: 'GroupFilter | PendingMemberFilters| Permissions| RemoteDeleteAnything',
                        name: 'remoteDeleteAnything',
                        type: 'options',

                        options: [
                          { name: 'REMOTE_DELETE_ANYTHING_UNSPECIFIED', value: 'REMOTE_DELETE_ANYTHING_UNSPECIFIED' },
                          { name: 'REMOTE_DELETE_ANYTHING_CAN', value: 'REMOTE_DELETE_ANYTHING_CAN' },
                          { name: 'REMOTE_DELETE_ANYTHING_CANNOT', value: 'REMOTE_DELETE_ANYTHING_CANNOT' },
                        ],
                        default: 'REMOTE_DELETE_ANYTHING_UNSPECIFIED',
                      },
                      {
                        displayName: 'GroupFilter | PendingMemberFilters| Permissions| EditOrRemoteDeleteOwnMessages',
                        name: 'editOrRemoteDeleteOwnMessages',
                        type: 'options',

                        options: [
                          { name: 'EDIT_OR_REMOTE_DELETE_OWN_MESSAGE_UNSPECIFIED', value: 'EDIT_OR_REMOTE_DELETE_OWN_MESSAGE_UNSPECIFIED' },
                          { name: 'EDIT_OR_REMOTE_DELETE_OWN_MESSAGE_CAN', value: 'EDIT_OR_REMOTE_DELETE_OWN_MESSAGE_CAN' },
                          { name: 'EDIT_OR_REMOTE_DELETE_OWN_MESSAGE_CANNOT', value: 'EDIT_OR_REMOTE_DELETE_OWN_MESSAGE_CANNOT' },
                        ],
                        default: 'EDIT_OR_REMOTE_DELETE_OWN_MESSAGE_UNSPECIFIED',
                      },
                      {
                        displayName: 'GroupFilter | PendingMemberFilters| Permissions| ChangeSettings',
                        name: 'changeSettings',
                        type: 'options',

                        options: [
                          { name: 'CHANGE_SETTINGS_UNSPECIFIED', value: 'CHANGE_SETTINGS_UNSPECIFIED' },
                          { name: 'CHANGE_SETTINGS_CAN', value: 'CHANGE_SETTINGS_CAN' },
                          { name: 'CHANGE_SETTINGS_CANNOT', value: 'CHANGE_SETTINGS_CANNOT' },
                        ],
                        default: 'CHANGE_SETTINGS_UNSPECIFIED',
                      },
                    ],
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
    updates: ['GroupNew'],
  },
};

export const groupNewProperties = updateDisplayOptions(displayOptions, properties);

export function groupNew(this: ITriggerFunctions, client: OlvidClient, onCallback?: Function, returnMockData: boolean = false): Function {
    const count: bigint | undefined = this.getNodeParameter('count') ? BigInt(this.getNodeParameter('count') as number) : undefined;
    function getGroupFilter(this: ITriggerFunctions, ): datatypes.GroupFilter | undefined {
        const itemGroupFilter = this.getNodeParameter('groupFilter') as IDataObject | undefined;
        if (itemGroupFilter === undefined) {
            return undefined;
        }
        function getType(this: ITriggerFunctions, itemGroupFilter: IDataObject): datatypes.Group_Type | undefined {
            const value: string | number | undefined = itemGroupFilter['type'] as string | number | undefined;
            if (value === undefined) {
                return undefined;
            }
            if (typeof value == 'number') {
                if (datatypes.Group_Type [value] === undefined) {
                    throw new Error('The attachment type "${value}" is not known.');
                }
                return value as datatypes.Group_Type;
            }
            else {
                const enumKey = value.replace("TYPE_", "");
                return datatypes.Group_Type [enumKey as keyof typeof datatypes.Group_Type];
            }
        }
        const type: datatypes.Group_Type | undefined = getType.call(this, itemGroupFilter);
        function getEmpty(this: ITriggerFunctions, itemGroupFilter: IDataObject): datatypes.GroupFilter_Empty | undefined {
            const value: string | number | undefined = itemGroupFilter['empty'] as string | number | undefined;
            if (value === undefined) {
                return undefined;
            }
            if (typeof value == 'number') {
                if (datatypes.GroupFilter_Empty [value] === undefined) {
                    throw new Error('The attachment type "${value}" is not known.');
                }
                return value as datatypes.GroupFilter_Empty;
            }
            else {
                const enumKey = value.replace("EMPTY_", "");
                return datatypes.GroupFilter_Empty [enumKey as keyof typeof datatypes.GroupFilter_Empty];
            }
        }
        const empty: datatypes.GroupFilter_Empty | undefined = getEmpty.call(this, itemGroupFilter);
        function getPhoto(this: ITriggerFunctions, itemGroupFilter: IDataObject): datatypes.GroupFilter_Photo | undefined {
            const value: string | number | undefined = itemGroupFilter['photo'] as string | number | undefined;
            if (value === undefined) {
                return undefined;
            }
            if (typeof value == 'number') {
                if (datatypes.GroupFilter_Photo [value] === undefined) {
                    throw new Error('The attachment type "${value}" is not known.');
                }
                return value as datatypes.GroupFilter_Photo;
            }
            else {
                const enumKey = value.replace("PHOTO_", "");
                return datatypes.GroupFilter_Photo [enumKey as keyof typeof datatypes.GroupFilter_Photo];
            }
        }
        const photo: datatypes.GroupFilter_Photo | undefined = getPhoto.call(this, itemGroupFilter);
        function getKeycloak(this: ITriggerFunctions, itemGroupFilter: IDataObject): datatypes.GroupFilter_Keycloak | undefined {
            const value: string | number | undefined = itemGroupFilter['keycloak'] as string | number | undefined;
            if (value === undefined) {
                return undefined;
            }
            if (typeof value == 'number') {
                if (datatypes.GroupFilter_Keycloak [value] === undefined) {
                    throw new Error('The attachment type "${value}" is not known.');
                }
                return value as datatypes.GroupFilter_Keycloak;
            }
            else {
                const enumKey = value.replace("KEYCLOAK_", "");
                return datatypes.GroupFilter_Keycloak [enumKey as keyof typeof datatypes.GroupFilter_Keycloak];
            }
        }
        const keycloak: datatypes.GroupFilter_Keycloak | undefined = getKeycloak.call(this, itemGroupFilter);
        function getOwnPermissionsFilter(this: ITriggerFunctions, itemGroupFilter: IDataObject): datatypes.GroupPermissionFilter | undefined {
            const itemOwnPermissionsFilter = itemGroupFilter['ownPermissionsFilter'] as IDataObject | undefined;
            if (itemOwnPermissionsFilter === undefined) {
                return undefined;
            }
            function getAdmin(this: ITriggerFunctions, itemGroupPermissionFilter: IDataObject): datatypes.GroupPermissionFilter_Admin | undefined {
                const value: string | number | undefined = itemGroupPermissionFilter['admin'] as string | number | undefined;
                if (value === undefined) {
                    return undefined;
                }
                if (typeof value == 'number') {
                    if (datatypes.GroupPermissionFilter_Admin [value] === undefined) {
                        throw new Error('The attachment type "${value}" is not known.');
                    }
                    return value as datatypes.GroupPermissionFilter_Admin;
                }
                else {
                    const enumKey = value.replace("ADMIN_", "");
                    return datatypes.GroupPermissionFilter_Admin [enumKey as keyof typeof datatypes.GroupPermissionFilter_Admin];
                }
            }
            const admin: datatypes.GroupPermissionFilter_Admin | undefined = getAdmin.call(this, itemOwnPermissionsFilter);
            function getSendMessage(this: ITriggerFunctions, itemGroupPermissionFilter: IDataObject): datatypes.GroupPermissionFilter_SendMessage | undefined {
                const value: string | number | undefined = itemGroupPermissionFilter['sendMessage'] as string | number | undefined;
                if (value === undefined) {
                    return undefined;
                }
                if (typeof value == 'number') {
                    if (datatypes.GroupPermissionFilter_SendMessage [value] === undefined) {
                        throw new Error('The attachment type "${value}" is not known.');
                    }
                    return value as datatypes.GroupPermissionFilter_SendMessage;
                }
                else {
                    const enumKey = value.replace("SENDMESSAGE_", "");
                    return datatypes.GroupPermissionFilter_SendMessage [enumKey as keyof typeof datatypes.GroupPermissionFilter_SendMessage];
                }
            }
            const sendMessage: datatypes.GroupPermissionFilter_SendMessage | undefined = getSendMessage.call(this, itemOwnPermissionsFilter);
            function getRemoteDeleteAnything(this: ITriggerFunctions, itemGroupPermissionFilter: IDataObject): datatypes.GroupPermissionFilter_RemoteDeleteAnything | undefined {
                const value: string | number | undefined = itemGroupPermissionFilter['remoteDeleteAnything'] as string | number | undefined;
                if (value === undefined) {
                    return undefined;
                }
                if (typeof value == 'number') {
                    if (datatypes.GroupPermissionFilter_RemoteDeleteAnything [value] === undefined) {
                        throw new Error('The attachment type "${value}" is not known.');
                    }
                    return value as datatypes.GroupPermissionFilter_RemoteDeleteAnything;
                }
                else {
                    const enumKey = value.replace("REMOTEDELETEANYTHING_", "");
                    return datatypes.GroupPermissionFilter_RemoteDeleteAnything [enumKey as keyof typeof datatypes.GroupPermissionFilter_RemoteDeleteAnything];
                }
            }
            const remoteDeleteAnything: datatypes.GroupPermissionFilter_RemoteDeleteAnything | undefined = getRemoteDeleteAnything.call(this, itemOwnPermissionsFilter);
            function getEditOrRemoteDeleteOwnMessages(this: ITriggerFunctions, itemGroupPermissionFilter: IDataObject): datatypes.GroupPermissionFilter_EditOrRemoteDeleteOwnMessage | undefined {
                const value: string | number | undefined = itemGroupPermissionFilter['editOrRemoteDeleteOwnMessages'] as string | number | undefined;
                if (value === undefined) {
                    return undefined;
                }
                if (typeof value == 'number') {
                    if (datatypes.GroupPermissionFilter_EditOrRemoteDeleteOwnMessage [value] === undefined) {
                        throw new Error('The attachment type "${value}" is not known.');
                    }
                    return value as datatypes.GroupPermissionFilter_EditOrRemoteDeleteOwnMessage;
                }
                else {
                    const enumKey = value.replace("EDITORREMOTEDELETEOWNMESSAGES_", "");
                    return datatypes.GroupPermissionFilter_EditOrRemoteDeleteOwnMessage [enumKey as keyof typeof datatypes.GroupPermissionFilter_EditOrRemoteDeleteOwnMessage];
                }
            }
            const editOrRemoteDeleteOwnMessages: datatypes.GroupPermissionFilter_EditOrRemoteDeleteOwnMessage | undefined = getEditOrRemoteDeleteOwnMessages.call(this, itemOwnPermissionsFilter);
            function getChangeSettings(this: ITriggerFunctions, itemGroupPermissionFilter: IDataObject): datatypes.GroupPermissionFilter_ChangeSettings | undefined {
                const value: string | number | undefined = itemGroupPermissionFilter['changeSettings'] as string | number | undefined;
                if (value === undefined) {
                    return undefined;
                }
                if (typeof value == 'number') {
                    if (datatypes.GroupPermissionFilter_ChangeSettings [value] === undefined) {
                        throw new Error('The attachment type "${value}" is not known.');
                    }
                    return value as datatypes.GroupPermissionFilter_ChangeSettings;
                }
                else {
                    const enumKey = value.replace("CHANGESETTINGS_", "");
                    return datatypes.GroupPermissionFilter_ChangeSettings [enumKey as keyof typeof datatypes.GroupPermissionFilter_ChangeSettings];
                }
            }
            const changeSettings: datatypes.GroupPermissionFilter_ChangeSettings | undefined = getChangeSettings.call(this, itemOwnPermissionsFilter);
            return new datatypes.GroupPermissionFilter({
                admin,
                sendMessage,
                remoteDeleteAnything,
                editOrRemoteDeleteOwnMessages,
                changeSettings,
            });
        }
        const ownPermissionsFilter: datatypes.GroupPermissionFilter | undefined = getOwnPermissionsFilter.call(this, itemGroupFilter);
        const nameSearch: string | undefined = itemGroupFilter['nameSearch'] ? itemGroupFilter['nameSearch'] as string : undefined;
        const descriptionSearch: string | undefined = itemGroupFilter['descriptionSearch'] ? itemGroupFilter['descriptionSearch'] as string : undefined;
        function getMemberFilters(this: ITriggerFunctions, itemGroupFilter: IDataObject): datatypes.GroupMemberFilter[] | undefined {
            function getMemberFilters(this: ITriggerFunctions, itemGroupFilter: IDataObject): datatypes.GroupMemberFilter {
                const itemMemberFilters = itemGroupFilter['memberFilters'] as IDataObject;
                const contactId: bigint | undefined = itemMemberFilters['contactId'] ? BigInt(itemMemberFilters['contactId'] as number) : undefined;
                function getPermissions(this: ITriggerFunctions, itemGroupMemberFilter: IDataObject): datatypes.GroupPermissionFilter | undefined {
                    const itemPermissions = itemGroupMemberFilter['permissions'] as IDataObject | undefined;
                    if (itemPermissions === undefined) {
                        return undefined;
                    }
                    function getAdmin(this: ITriggerFunctions, itemGroupPermissionFilter: IDataObject): datatypes.GroupPermissionFilter_Admin | undefined {
                        const value: string | number | undefined = itemGroupPermissionFilter['admin'] as string | number | undefined;
                        if (value === undefined) {
                            return undefined;
                        }
                        if (typeof value == 'number') {
                            if (datatypes.GroupPermissionFilter_Admin [value] === undefined) {
                                throw new Error('The attachment type "${value}" is not known.');
                            }
                            return value as datatypes.GroupPermissionFilter_Admin;
                        }
                        else {
                            const enumKey = value.replace("ADMIN_", "");
                            return datatypes.GroupPermissionFilter_Admin [enumKey as keyof typeof datatypes.GroupPermissionFilter_Admin];
                        }
                    }
                    const admin: datatypes.GroupPermissionFilter_Admin | undefined = getAdmin.call(this, itemPermissions);
                    function getSendMessage(this: ITriggerFunctions, itemGroupPermissionFilter: IDataObject): datatypes.GroupPermissionFilter_SendMessage | undefined {
                        const value: string | number | undefined = itemGroupPermissionFilter['sendMessage'] as string | number | undefined;
                        if (value === undefined) {
                            return undefined;
                        }
                        if (typeof value == 'number') {
                            if (datatypes.GroupPermissionFilter_SendMessage [value] === undefined) {
                                throw new Error('The attachment type "${value}" is not known.');
                            }
                            return value as datatypes.GroupPermissionFilter_SendMessage;
                        }
                        else {
                            const enumKey = value.replace("SENDMESSAGE_", "");
                            return datatypes.GroupPermissionFilter_SendMessage [enumKey as keyof typeof datatypes.GroupPermissionFilter_SendMessage];
                        }
                    }
                    const sendMessage: datatypes.GroupPermissionFilter_SendMessage | undefined = getSendMessage.call(this, itemPermissions);
                    function getRemoteDeleteAnything(this: ITriggerFunctions, itemGroupPermissionFilter: IDataObject): datatypes.GroupPermissionFilter_RemoteDeleteAnything | undefined {
                        const value: string | number | undefined = itemGroupPermissionFilter['remoteDeleteAnything'] as string | number | undefined;
                        if (value === undefined) {
                            return undefined;
                        }
                        if (typeof value == 'number') {
                            if (datatypes.GroupPermissionFilter_RemoteDeleteAnything [value] === undefined) {
                                throw new Error('The attachment type "${value}" is not known.');
                            }
                            return value as datatypes.GroupPermissionFilter_RemoteDeleteAnything;
                        }
                        else {
                            const enumKey = value.replace("REMOTEDELETEANYTHING_", "");
                            return datatypes.GroupPermissionFilter_RemoteDeleteAnything [enumKey as keyof typeof datatypes.GroupPermissionFilter_RemoteDeleteAnything];
                        }
                    }
                    const remoteDeleteAnything: datatypes.GroupPermissionFilter_RemoteDeleteAnything | undefined = getRemoteDeleteAnything.call(this, itemPermissions);
                    function getEditOrRemoteDeleteOwnMessages(this: ITriggerFunctions, itemGroupPermissionFilter: IDataObject): datatypes.GroupPermissionFilter_EditOrRemoteDeleteOwnMessage | undefined {
                        const value: string | number | undefined = itemGroupPermissionFilter['editOrRemoteDeleteOwnMessages'] as string | number | undefined;
                        if (value === undefined) {
                            return undefined;
                        }
                        if (typeof value == 'number') {
                            if (datatypes.GroupPermissionFilter_EditOrRemoteDeleteOwnMessage [value] === undefined) {
                                throw new Error('The attachment type "${value}" is not known.');
                            }
                            return value as datatypes.GroupPermissionFilter_EditOrRemoteDeleteOwnMessage;
                        }
                        else {
                            const enumKey = value.replace("EDITORREMOTEDELETEOWNMESSAGES_", "");
                            return datatypes.GroupPermissionFilter_EditOrRemoteDeleteOwnMessage [enumKey as keyof typeof datatypes.GroupPermissionFilter_EditOrRemoteDeleteOwnMessage];
                        }
                    }
                    const editOrRemoteDeleteOwnMessages: datatypes.GroupPermissionFilter_EditOrRemoteDeleteOwnMessage | undefined = getEditOrRemoteDeleteOwnMessages.call(this, itemPermissions);
                    function getChangeSettings(this: ITriggerFunctions, itemGroupPermissionFilter: IDataObject): datatypes.GroupPermissionFilter_ChangeSettings | undefined {
                        const value: string | number | undefined = itemGroupPermissionFilter['changeSettings'] as string | number | undefined;
                        if (value === undefined) {
                            return undefined;
                        }
                        if (typeof value == 'number') {
                            if (datatypes.GroupPermissionFilter_ChangeSettings [value] === undefined) {
                                throw new Error('The attachment type "${value}" is not known.');
                            }
                            return value as datatypes.GroupPermissionFilter_ChangeSettings;
                        }
                        else {
                            const enumKey = value.replace("CHANGESETTINGS_", "");
                            return datatypes.GroupPermissionFilter_ChangeSettings [enumKey as keyof typeof datatypes.GroupPermissionFilter_ChangeSettings];
                        }
                    }
                    const changeSettings: datatypes.GroupPermissionFilter_ChangeSettings | undefined = getChangeSettings.call(this, itemPermissions);
                    return new datatypes.GroupPermissionFilter({
                        admin,
                        sendMessage,
                        remoteDeleteAnything,
                        editOrRemoteDeleteOwnMessages,
                        changeSettings,
                    });
                }
                const permissions: datatypes.GroupPermissionFilter | undefined = getPermissions.call(this, itemMemberFilters);
                return new datatypes.GroupMemberFilter({
                    contactId,
                    permissions,
                });
            }
            const memberFiltersCollectionParent: IDataObject | undefined = itemGroupFilter['memberFiltersList'] as IDataObject | undefined;
            if (memberFiltersCollectionParent === undefined) {
                return [];
            }
            const memberFiltersCollection: IDataObject[] | undefined = memberFiltersCollectionParent['collection'] as IDataObject[] | undefined;
            if (memberFiltersCollection === undefined) {
                return [];
            }
            const memberFiltersList: datatypes.GroupMemberFilter[] = [];
            for (const itemMemberFilters of memberFiltersCollection) {
                const memberFilters: datatypes.GroupMemberFilter = getMemberFilters.call(this, itemMemberFilters);
                memberFiltersList.push(memberFilters);
            }
            return memberFiltersList;
        }
        const memberFilters: datatypes.GroupMemberFilter[] | undefined = getMemberFilters.call(this, itemGroupFilter);
        function getPendingMemberFilters(this: ITriggerFunctions, itemGroupFilter: IDataObject): datatypes.PendingGroupMemberFilter[] | undefined {
            function getPendingMemberFilters(this: ITriggerFunctions, itemGroupFilter: IDataObject): datatypes.PendingGroupMemberFilter {
                const itemPendingMemberFilters = itemGroupFilter['pendingMemberFilters'] as IDataObject;
                function getIsContact(this: ITriggerFunctions, itemPendingGroupMemberFilter: IDataObject): datatypes.PendingGroupMemberFilter_Contact | undefined {
                    const value: string | number | undefined = itemPendingGroupMemberFilter['isContact'] as string | number | undefined;
                    if (value === undefined) {
                        return undefined;
                    }
                    if (typeof value == 'number') {
                        if (datatypes.PendingGroupMemberFilter_Contact [value] === undefined) {
                            throw new Error('The attachment type "${value}" is not known.');
                        }
                        return value as datatypes.PendingGroupMemberFilter_Contact;
                    }
                    else {
                        const enumKey = value.replace("ISCONTACT_", "");
                        return datatypes.PendingGroupMemberFilter_Contact [enumKey as keyof typeof datatypes.PendingGroupMemberFilter_Contact];
                    }
                }
                const isContact: datatypes.PendingGroupMemberFilter_Contact | undefined = getIsContact.call(this, itemPendingMemberFilters);
                function getHasDeclined(this: ITriggerFunctions, itemPendingGroupMemberFilter: IDataObject): datatypes.PendingGroupMemberFilter_Declined | undefined {
                    const value: string | number | undefined = itemPendingGroupMemberFilter['hasDeclined'] as string | number | undefined;
                    if (value === undefined) {
                        return undefined;
                    }
                    if (typeof value == 'number') {
                        if (datatypes.PendingGroupMemberFilter_Declined [value] === undefined) {
                            throw new Error('The attachment type "${value}" is not known.');
                        }
                        return value as datatypes.PendingGroupMemberFilter_Declined;
                    }
                    else {
                        const enumKey = value.replace("HASDECLINED_", "");
                        return datatypes.PendingGroupMemberFilter_Declined [enumKey as keyof typeof datatypes.PendingGroupMemberFilter_Declined];
                    }
                }
                const hasDeclined: datatypes.PendingGroupMemberFilter_Declined | undefined = getHasDeclined.call(this, itemPendingMemberFilters);
                const contactId: bigint | undefined = itemPendingMemberFilters['contactId'] ? BigInt(itemPendingMemberFilters['contactId'] as number) : undefined;
                const displayNameSearch: string | undefined = itemPendingMemberFilters['displayNameSearch'] ? itemPendingMemberFilters['displayNameSearch'] as string : undefined;
                function getPermissions(this: ITriggerFunctions, itemPendingGroupMemberFilter: IDataObject): datatypes.GroupPermissionFilter | undefined {
                    const itemPermissions = itemPendingGroupMemberFilter['permissions'] as IDataObject | undefined;
                    if (itemPermissions === undefined) {
                        return undefined;
                    }
                    function getAdmin(this: ITriggerFunctions, itemGroupPermissionFilter: IDataObject): datatypes.GroupPermissionFilter_Admin | undefined {
                        const value: string | number | undefined = itemGroupPermissionFilter['admin'] as string | number | undefined;
                        if (value === undefined) {
                            return undefined;
                        }
                        if (typeof value == 'number') {
                            if (datatypes.GroupPermissionFilter_Admin [value] === undefined) {
                                throw new Error('The attachment type "${value}" is not known.');
                            }
                            return value as datatypes.GroupPermissionFilter_Admin;
                        }
                        else {
                            const enumKey = value.replace("ADMIN_", "");
                            return datatypes.GroupPermissionFilter_Admin [enumKey as keyof typeof datatypes.GroupPermissionFilter_Admin];
                        }
                    }
                    const admin: datatypes.GroupPermissionFilter_Admin | undefined = getAdmin.call(this, itemPermissions);
                    function getSendMessage(this: ITriggerFunctions, itemGroupPermissionFilter: IDataObject): datatypes.GroupPermissionFilter_SendMessage | undefined {
                        const value: string | number | undefined = itemGroupPermissionFilter['sendMessage'] as string | number | undefined;
                        if (value === undefined) {
                            return undefined;
                        }
                        if (typeof value == 'number') {
                            if (datatypes.GroupPermissionFilter_SendMessage [value] === undefined) {
                                throw new Error('The attachment type "${value}" is not known.');
                            }
                            return value as datatypes.GroupPermissionFilter_SendMessage;
                        }
                        else {
                            const enumKey = value.replace("SENDMESSAGE_", "");
                            return datatypes.GroupPermissionFilter_SendMessage [enumKey as keyof typeof datatypes.GroupPermissionFilter_SendMessage];
                        }
                    }
                    const sendMessage: datatypes.GroupPermissionFilter_SendMessage | undefined = getSendMessage.call(this, itemPermissions);
                    function getRemoteDeleteAnything(this: ITriggerFunctions, itemGroupPermissionFilter: IDataObject): datatypes.GroupPermissionFilter_RemoteDeleteAnything | undefined {
                        const value: string | number | undefined = itemGroupPermissionFilter['remoteDeleteAnything'] as string | number | undefined;
                        if (value === undefined) {
                            return undefined;
                        }
                        if (typeof value == 'number') {
                            if (datatypes.GroupPermissionFilter_RemoteDeleteAnything [value] === undefined) {
                                throw new Error('The attachment type "${value}" is not known.');
                            }
                            return value as datatypes.GroupPermissionFilter_RemoteDeleteAnything;
                        }
                        else {
                            const enumKey = value.replace("REMOTEDELETEANYTHING_", "");
                            return datatypes.GroupPermissionFilter_RemoteDeleteAnything [enumKey as keyof typeof datatypes.GroupPermissionFilter_RemoteDeleteAnything];
                        }
                    }
                    const remoteDeleteAnything: datatypes.GroupPermissionFilter_RemoteDeleteAnything | undefined = getRemoteDeleteAnything.call(this, itemPermissions);
                    function getEditOrRemoteDeleteOwnMessages(this: ITriggerFunctions, itemGroupPermissionFilter: IDataObject): datatypes.GroupPermissionFilter_EditOrRemoteDeleteOwnMessage | undefined {
                        const value: string | number | undefined = itemGroupPermissionFilter['editOrRemoteDeleteOwnMessages'] as string | number | undefined;
                        if (value === undefined) {
                            return undefined;
                        }
                        if (typeof value == 'number') {
                            if (datatypes.GroupPermissionFilter_EditOrRemoteDeleteOwnMessage [value] === undefined) {
                                throw new Error('The attachment type "${value}" is not known.');
                            }
                            return value as datatypes.GroupPermissionFilter_EditOrRemoteDeleteOwnMessage;
                        }
                        else {
                            const enumKey = value.replace("EDITORREMOTEDELETEOWNMESSAGES_", "");
                            return datatypes.GroupPermissionFilter_EditOrRemoteDeleteOwnMessage [enumKey as keyof typeof datatypes.GroupPermissionFilter_EditOrRemoteDeleteOwnMessage];
                        }
                    }
                    const editOrRemoteDeleteOwnMessages: datatypes.GroupPermissionFilter_EditOrRemoteDeleteOwnMessage | undefined = getEditOrRemoteDeleteOwnMessages.call(this, itemPermissions);
                    function getChangeSettings(this: ITriggerFunctions, itemGroupPermissionFilter: IDataObject): datatypes.GroupPermissionFilter_ChangeSettings | undefined {
                        const value: string | number | undefined = itemGroupPermissionFilter['changeSettings'] as string | number | undefined;
                        if (value === undefined) {
                            return undefined;
                        }
                        if (typeof value == 'number') {
                            if (datatypes.GroupPermissionFilter_ChangeSettings [value] === undefined) {
                                throw new Error('The attachment type "${value}" is not known.');
                            }
                            return value as datatypes.GroupPermissionFilter_ChangeSettings;
                        }
                        else {
                            const enumKey = value.replace("CHANGESETTINGS_", "");
                            return datatypes.GroupPermissionFilter_ChangeSettings [enumKey as keyof typeof datatypes.GroupPermissionFilter_ChangeSettings];
                        }
                    }
                    const changeSettings: datatypes.GroupPermissionFilter_ChangeSettings | undefined = getChangeSettings.call(this, itemPermissions);
                    return new datatypes.GroupPermissionFilter({
                        admin,
                        sendMessage,
                        remoteDeleteAnything,
                        editOrRemoteDeleteOwnMessages,
                        changeSettings,
                    });
                }
                const permissions: datatypes.GroupPermissionFilter | undefined = getPermissions.call(this, itemPendingMemberFilters);
                return new datatypes.PendingGroupMemberFilter({
                    isContact,
                    hasDeclined,
                    contactId,
                    displayNameSearch,
                    permissions,
                });
            }
            const pendingMemberFiltersCollectionParent: IDataObject | undefined = itemGroupFilter['pendingMemberFiltersList'] as IDataObject | undefined;
            if (pendingMemberFiltersCollectionParent === undefined) {
                return [];
            }
            const pendingMemberFiltersCollection: IDataObject[] | undefined = pendingMemberFiltersCollectionParent['collection'] as IDataObject[] | undefined;
            if (pendingMemberFiltersCollection === undefined) {
                return [];
            }
            const pendingMemberFiltersList: datatypes.PendingGroupMemberFilter[] = [];
            for (const itemPendingMemberFilters of pendingMemberFiltersCollection) {
                const pendingMemberFilters: datatypes.PendingGroupMemberFilter = getPendingMemberFilters.call(this, itemPendingMemberFilters);
                pendingMemberFiltersList.push(pendingMemberFilters);
            }
            return pendingMemberFiltersList;
        }
        const pendingMemberFilters: datatypes.PendingGroupMemberFilter[] | undefined = getPendingMemberFilters.call(this, itemGroupFilter);
        return new datatypes.GroupFilter({
            type,
            empty,
            photo,
            keycloak,
            ownPermissionsFilter,
            nameSearch,
            descriptionSearch,
            memberFilters,
            pendingMemberFilters,
        });
    }
    const groupFilter: datatypes.GroupFilter | undefined = getGroupFilter.call(this, );

    if (returnMockData) {
        this.emit([this.helpers.returnJsonArray([{
// group.mockData
        }])]);
        onCallback?.();
        return () => {};
    }

	const callback = (notification: notifications.GroupNewNotification) => {
		this.emit([this.helpers.returnJsonArray({id: Number(notification?.group?.id), type: datatypes.Group_Type[notification?.group?.type ?? 0], advancedConfiguration: {readOnly: notification?.group?.advancedConfiguration?.readOnly, remoteDelete: datatypes.Group_AdvancedConfiguration_RemoteDelete[notification?.group?.advancedConfiguration?.remoteDelete ?? 0]}, ownPermissions: {admin: notification?.group?.ownPermissions?.admin, remoteDeleteAnything: notification?.group?.ownPermissions?.remoteDeleteAnything, editOrRemoteDeleteOwnMessages: notification?.group?.ownPermissions?.editOrRemoteDeleteOwnMessages, changeSettings: notification?.group?.ownPermissions?.changeSettings, sendMessage: notification?.group?.ownPermissions?.sendMessage}, members: notification?.group?.members.map(e => ({contactId: Number(e.contactId), permissions: {admin: e.permissions?.admin, remoteDeleteAnything: e.permissions?.remoteDeleteAnything, editOrRemoteDeleteOwnMessages: e.permissions?.editOrRemoteDeleteOwnMessages, changeSettings: e.permissions?.changeSettings, sendMessage: e.permissions?.sendMessage}})), pendingMembers: notification?.group?.pendingMembers.map(e => ({pendingMemberId: Number(e.pendingMemberId), contactId: Number(e.contactId), displayName: e.displayName, declined: e.declined, permissions: {admin: e.permissions?.admin, remoteDeleteAnything: e.permissions?.remoteDeleteAnything, editOrRemoteDeleteOwnMessages: e.permissions?.editOrRemoteDeleteOwnMessages, changeSettings: e.permissions?.changeSettings, sendMessage: e.permissions?.sendMessage}})), updateInProgress: notification?.group?.updateInProgress, keycloakManaged: notification?.group?.keycloakManaged, name: notification?.group?.name, description: notification?.group?.description, hasAPhoto: notification?.group?.hasAPhoto})]);
		onCallback?.();
	}

	return client.stubs.groupNotificationStub.groupNew({count, groupFilter}, callback, () => {});

}
