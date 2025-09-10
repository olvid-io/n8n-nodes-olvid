import type { Schema } from '@bufbuild/protoplugin';
import type { DescMethod } from '@bufbuild/protobuf';
import { generateTriggerPropertiesJson } from './generateTriggerMethodProperties';
import { generateTriggerHandler } from './generateTriggerHandler';


export function generateTrigger(
	schema: Schema,
	method: DescMethod,
	useAdminClient: boolean,
): void {
	const path = `triggers/${method.parent.name}/on${method.name}`;
	const destinationFile = schema.generateFile(`${path}.event.ts`);

	destinationFile.print`/* eslint-disable n8n-nodes-base/node-param-display-name-miscased-id,n8n-nodes-base/node-param-required-false,n8n-nodes-base/node-param-collection-type-unsorted-items,n8n-nodes-base/node-param-options-type-unsorted-items */
import { ${useAdminClient ? 'OlvidAdminClient' : 'OlvidClient'} } from '../../../../../client/${useAdminClient ? 'OlvidAdminClient' : 'OlvidClient'}';
// noinspection ES6UnusedImports
import * as datatypes from '../../../../../protobuf/olvid/daemon/datatypes/v1/datatypes';
// noinspection ES6UnusedImports
import * as notifications from '../../../../../protobuf/olvid/daemon/notification/v1/notification';
// noinspection ES6UnusedImports
import { type ITriggerFunctions, type IDataObject, type INodeProperties, updateDisplayOptions, replaceCircularReferences } from 'n8n-workflow';
// noinspection ES6UnusedImports
import { create } from '@bufbuild/protobuf';
`

	generateTriggerPropertiesJson(destinationFile, method);

	generateTriggerHandler(destinationFile, method, useAdminClient);
}
