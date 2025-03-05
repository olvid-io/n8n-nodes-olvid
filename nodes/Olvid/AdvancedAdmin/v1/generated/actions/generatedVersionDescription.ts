// @generated by protoc-gen-n8n-actions v1 with parameter "target=ts"

import { INodePropertyOptions, INodeProperties } from 'n8n-workflow';

import * as ClientKeyAdminService from './ClientKeyAdminService';
import * as IdentityAdminService from './IdentityAdminService';

export const resourceOptionsList: INodePropertyOptions[] = [
  {name: 'ClientKeyAdminService', value: 'ClientKeyAdminService'},
  {name: 'IdentityAdminService', value: 'IdentityAdminService'},
];

export const resourceDescriptions: INodeProperties[] = [
  ...ClientKeyAdminService.descriptions,
  ...IdentityAdminService.descriptions,
];
