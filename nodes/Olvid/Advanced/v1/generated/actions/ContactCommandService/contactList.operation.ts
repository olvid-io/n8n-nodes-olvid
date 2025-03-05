// @generated by protoc-gen-n8n-actions v1 with parameter "target=ts"
// @generated from file olvid/daemon/services/v1/command_service.proto (package olvid.daemon.services.v1, syntax proto3)
/* eslint-disable */

import { type IExecuteFunctions, type INodeExecutionData, type IDataObject, type INodeProperties, updateDisplayOptions } from 'n8n-workflow';

// noinspection ES6UnusedImports
import { datatypes, OlvidClient, commands } from '@olvid/bot-node';

const properties: INodeProperties[] = [
  {
    displayName: 'Filter',
    name: 'filter',
    type: 'collection',
    default: {
    },
    options: [
      {
        displayName: 'Filter | OneToOne',
        name: 'oneToOne',
        type: 'options',

        options: [
          { name: 'ONE_TO_ONE_UNSPECIFIED', value: 'ONE_TO_ONE_UNSPECIFIED' },
          { name: 'ONE_TO_ONE_IS', value: 'ONE_TO_ONE_IS' },
          { name: 'ONE_TO_ONE_IS_NOT', value: 'ONE_TO_ONE_IS_NOT' },
        ],
        default: 'ONE_TO_ONE_UNSPECIFIED',
      },
      {
        displayName: 'Filter | Photo',
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
        displayName: 'Filter | Keycloak',
        name: 'keycloak',
        type: 'options',

        options: [
          { name: 'KEYCLOAK_UNSPECIFIED', value: 'KEYCLOAK_UNSPECIFIED' },
          { name: 'KEYCLOAK_MANAGED', value: 'KEYCLOAK_MANAGED' },
          { name: 'KEYCLOAK_NOT_MANAGED', value: 'KEYCLOAK_NOT_MANAGED' },
        ],
        default: 'KEYCLOAK_UNSPECIFIED',
      },
      {
        displayName: 'Filter | DisplayNameSearch',
        name: 'displayNameSearch',
        type: 'string',


        default: '',
      },
      {
        displayName: 'Filter | DetailsSearch',
        name: 'detailsSearch',
        type: 'collection',
        default: {
        },
        options: [
          {
            displayName: 'Filter | DetailsSearch| FirstName',
            name: 'firstName',
            type: 'string',


            default: '',
          },
          {
            displayName: 'Filter | DetailsSearch| LastName',
            name: 'lastName',
            type: 'string',


            default: '',
          },
          {
            displayName: 'Filter | DetailsSearch| Company',
            name: 'company',
            type: 'string',


            default: '',
          },
          {
            displayName: 'Filter | DetailsSearch| Position',
            name: 'position',
            type: 'string',


            default: '',
          },
        ],
      },
    ],
  },
];

const displayOptions = {
  show: {
    resource: ['ContactCommandService'],
    operation: ['ContactList'],
  },
};

export const description = updateDisplayOptions(displayOptions, properties);

export async function execute(this: IExecuteFunctions, index: number, client: OlvidClient): Promise<INodeExecutionData[]> {
    function getFilter(this: IExecuteFunctions, index: number): datatypes.ContactFilter | undefined {
        const itemFilter = this.getNodeParameter('filter', index) as IDataObject | undefined;
        if (itemFilter === undefined) {
            return undefined;
        }
        function getOneToOne(this: IExecuteFunctions, itemContactFilter: IDataObject): datatypes.ContactFilter_OneToOne | undefined {
            const value: string | number | undefined = itemContactFilter['oneToOne'] as string | number | undefined;
            if (value === undefined) {
                return undefined;
            }
            if (typeof value == 'number') {
                if (datatypes.ContactFilter_OneToOne [value] === undefined) {
                    throw new Error('The attachment type "${value}" is not known.');
                }
                return value as datatypes.ContactFilter_OneToOne;
            }
            else {
                const enumKey = value.replace("ONETOONE_", "");
                return datatypes.ContactFilter_OneToOne [enumKey as keyof typeof datatypes.ContactFilter_OneToOne];
            }
        }
        const oneToOne: datatypes.ContactFilter_OneToOne | undefined = getOneToOne.call(this, itemFilter);
        function getPhoto(this: IExecuteFunctions, itemContactFilter: IDataObject): datatypes.ContactFilter_Photo | undefined {
            const value: string | number | undefined = itemContactFilter['photo'] as string | number | undefined;
            if (value === undefined) {
                return undefined;
            }
            if (typeof value == 'number') {
                if (datatypes.ContactFilter_Photo [value] === undefined) {
                    throw new Error('The attachment type "${value}" is not known.');
                }
                return value as datatypes.ContactFilter_Photo;
            }
            else {
                const enumKey = value.replace("PHOTO_", "");
                return datatypes.ContactFilter_Photo [enumKey as keyof typeof datatypes.ContactFilter_Photo];
            }
        }
        const photo: datatypes.ContactFilter_Photo | undefined = getPhoto.call(this, itemFilter);
        function getKeycloak(this: IExecuteFunctions, itemContactFilter: IDataObject): datatypes.ContactFilter_Keycloak | undefined {
            const value: string | number | undefined = itemContactFilter['keycloak'] as string | number | undefined;
            if (value === undefined) {
                return undefined;
            }
            if (typeof value == 'number') {
                if (datatypes.ContactFilter_Keycloak [value] === undefined) {
                    throw new Error('The attachment type "${value}" is not known.');
                }
                return value as datatypes.ContactFilter_Keycloak;
            }
            else {
                const enumKey = value.replace("KEYCLOAK_", "");
                return datatypes.ContactFilter_Keycloak [enumKey as keyof typeof datatypes.ContactFilter_Keycloak];
            }
        }
        const keycloak: datatypes.ContactFilter_Keycloak | undefined = getKeycloak.call(this, itemFilter);
        const displayNameSearch: string | undefined = itemFilter['displayNameSearch'] ? itemFilter['displayNameSearch'] as string : undefined;
        function getDetailsSearch(this: IExecuteFunctions, itemContactFilter: IDataObject): datatypes.IdentityDetails | undefined {
            const itemDetailsSearch = itemContactFilter['detailsSearch'] as IDataObject | undefined;
            if (itemDetailsSearch === undefined) {
                return undefined;
            }
            const firstName: string | undefined = itemDetailsSearch['firstName'] ? itemDetailsSearch['firstName'] as string : undefined;
            const lastName: string | undefined = itemDetailsSearch['lastName'] ? itemDetailsSearch['lastName'] as string : undefined;
            const company: string | undefined = itemDetailsSearch['company'] ? itemDetailsSearch['company'] as string : undefined;
            const position: string | undefined = itemDetailsSearch['position'] ? itemDetailsSearch['position'] as string : undefined;
            return new datatypes.IdentityDetails({
                firstName,
                lastName,
                company,
                position,
            });
        }
        const detailsSearch: datatypes.IdentityDetails | undefined = getDetailsSearch.call(this, itemFilter);
        return new datatypes.ContactFilter({
            oneToOne,
            photo,
            keycloak,
            displayNameSearch,
            detailsSearch,
        });
    }
    const filter: datatypes.ContactFilter | undefined = getFilter.call(this, index);

    const containerMessage: commands.ContactListResponse = new commands.ContactListResponse();
    for await (const message of client.stubs.contactCommandStub.contactList({filter})) {
        containerMessage.contacts.push(...message.contacts);
    }

    return this.helpers.returnJsonArray(containerMessage?.contacts.map(e => ({id: Number(e.id), displayName: e.displayName, details: {firstName: e.details?.firstName, lastName: e.details?.lastName, company: e.details?.company, position: e.details?.position}, establishedChannelCount: e.establishedChannelCount, deviceCount: e.deviceCount, hasOneToOneDiscussion: e.hasOneToOneDiscussion, hasAPhoto: e.hasAPhoto, keycloakManaged: e.keycloakManaged}))
);
}
