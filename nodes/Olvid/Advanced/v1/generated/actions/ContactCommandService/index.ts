// @generated by protoc-gen-n8n-actions v1 with parameter "target=ts"

import type { INodeProperties } from 'n8n-workflow';
import * as ContactList from './contactList.operation';
import * as ContactGet from './contactGet.operation';
import * as ContactGetBytesIdentifier from './contactGetBytesIdentifier.operation';
import * as ContactGetInvitationLink from './contactGetInvitationLink.operation';
import * as ContactDelete from './contactDelete.operation';
import * as ContactIntroduction from './contactIntroduction.operation';
import * as ContactDownloadPhoto from './contactDownloadPhoto.operation';
import * as ContactRecreateChannels from './contactRecreateChannels.operation';
import * as ContactInviteToOneToOneDiscussion from './contactInviteToOneToOneDiscussion.operation';
import * as ContactDowngradeOneToOneDiscussion from './contactDowngradeOneToOneDiscussion.operation';

export { ContactList, ContactGet, ContactGetBytesIdentifier, ContactGetInvitationLink, ContactDelete, ContactIntroduction, ContactDownloadPhoto, ContactRecreateChannels, ContactInviteToOneToOneDiscussion, ContactDowngradeOneToOneDiscussion};

export const descriptions: INodeProperties[] = [
  {
    displayName: 'Operation',
    name: 'operation',
    type: 'options',
    noDataExpression: true,
    displayOptions: {
      show: {
        resource: ['ContactCommandService'],
      },
    },
    // eslint-disable-next-line n8n-nodes-base/node-param-options-type-unsorted-items
    options: [
      {
        name: 'ContactList',
        value: 'ContactList',
        action: 'Contact list',
      },
      {
        name: 'ContactGet',
        value: 'ContactGet',
        action: 'Contact get',
      },
      {
        name: 'ContactGetBytesIdentifier',
        value: 'ContactGetBytesIdentifier',
        action: 'Contact get bytes identifier',
      },
      {
        name: 'ContactGetInvitationLink',
        value: 'ContactGetInvitationLink',
        action: 'Contact get invitation link',
      },
      {
        name: 'ContactDelete',
        value: 'ContactDelete',
        action: 'Contact delete',
      },
      {
        name: 'ContactIntroduction',
        value: 'ContactIntroduction',
        action: 'Contact introduction',
      },
      {
        name: 'ContactDownloadPhoto',
        value: 'ContactDownloadPhoto',
        action: 'Contact download photo',
      },
      {
        name: 'ContactRecreateChannels',
        value: 'ContactRecreateChannels',
        action: 'Contact recreate channels',
      },
      {
        name: 'ContactInviteToOneToOneDiscussion',
        value: 'ContactInviteToOneToOneDiscussion',
        action: 'Contact invite to one to one discussion',
      },
      {
        name: 'ContactDowngradeOneToOneDiscussion',
        value: 'ContactDowngradeOneToOneDiscussion',
        action: 'Contact downgrade one to one discussion',
      },
    ],
    default: 'ContactList',
  },
  ...ContactList.description,
  ...ContactGet.description,
  ...ContactGetBytesIdentifier.description,
  ...ContactGetInvitationLink.description,
  ...ContactDelete.description,
  ...ContactIntroduction.description,
  ...ContactDownloadPhoto.description,
  ...ContactRecreateChannels.description,
  ...ContactInviteToOneToOneDiscussion.description,
  ...ContactDowngradeOneToOneDiscussion.description,
];
