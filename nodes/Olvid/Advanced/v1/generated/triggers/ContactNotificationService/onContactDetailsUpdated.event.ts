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
  {
    displayName: 'ContactIds - List',
    name: 'contactIdsList',
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
            displayName: 'ContactIds',
            name: 'contactIds',
            type: 'number',


            default: 0,
          },
        ],
      },
    ],
  },
];

const displayOptions = {
  show: {
    updates: ['ContactDetailsUpdated'],
  },
};

export const contactDetailsUpdatedProperties = updateDisplayOptions(displayOptions, properties);

export function contactDetailsUpdated(this: ITriggerFunctions, client: OlvidClient, onCallback?: Function, returnMockData: boolean = false): Function {
    const count: bigint | undefined = this.getNodeParameter('count') ? BigInt(this.getNodeParameter('count') as number) : undefined;
    function getFilter(this: ITriggerFunctions, ): datatypes.ContactFilter | undefined {
        const itemFilter = this.getNodeParameter('filter') as IDataObject | undefined;
        if (itemFilter === undefined) {
            return undefined;
        }
        function getOneToOne(this: ITriggerFunctions, itemContactFilter: IDataObject): datatypes.ContactFilter_OneToOne | undefined {
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
        function getPhoto(this: ITriggerFunctions, itemContactFilter: IDataObject): datatypes.ContactFilter_Photo | undefined {
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
        function getKeycloak(this: ITriggerFunctions, itemContactFilter: IDataObject): datatypes.ContactFilter_Keycloak | undefined {
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
        function getDetailsSearch(this: ITriggerFunctions, itemContactFilter: IDataObject): datatypes.IdentityDetails | undefined {
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
    const filter: datatypes.ContactFilter | undefined = getFilter.call(this, );
    function getContactIds(this: ITriggerFunctions, ): bigint[] {
        const contactIdsCollectionParent: IDataObject | undefined = this.getNodeParameter('contactIdsList') as IDataObject | undefined;
        if (contactIdsCollectionParent === undefined) {
            return [];
        }
        const contactIdsCollection: IDataObject[] | undefined = contactIdsCollectionParent['collection'] as IDataObject[] | undefined;
        if (contactIdsCollection === undefined) {
            return [];
        }
        const contactIdsList: bigint[] = [];
        for (const itemContactIds of contactIdsCollection) {
            const contactIds: bigint = BigInt(itemContactIds['contactIds'] as number);
            contactIdsList.push(contactIds);
        }
        return contactIdsList;
    }
    const contactIds: bigint[] = getContactIds.call(this, );

    if (returnMockData) {
        this.emit([this.helpers.returnJsonArray([{
// contact.mockData,
// previousDetails.mockData
        }])]);
        onCallback?.();
        return () => {};
    }

	const callback = (notification: notifications.ContactDetailsUpdatedNotification) => {
		this.emit([this.helpers.returnJsonArray([{contact: {id: Number(notification?.contact?.id), displayName: notification?.contact?.displayName, details: {firstName: notification?.contact?.details?.firstName, lastName: notification?.contact?.details?.lastName, company: notification?.contact?.details?.company, position: notification?.contact?.details?.position}, establishedChannelCount: notification?.contact?.establishedChannelCount, deviceCount: notification?.contact?.deviceCount, hasOneToOneDiscussion: notification?.contact?.hasOneToOneDiscussion, hasAPhoto: notification?.contact?.hasAPhoto, keycloakManaged: notification?.contact?.keycloakManaged}},{previousDetails: {firstName: notification?.previousDetails?.firstName, lastName: notification?.previousDetails?.lastName, company: notification?.previousDetails?.company, position: notification?.previousDetails?.position}}])]);
		onCallback?.();
	}

	return client.stubs.contactNotificationStub.contactDetailsUpdated({count, filter, contactIds}, callback, () => {});

}
