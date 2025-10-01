import type { GeneratedFile } from '@bufbuild/protoplugin';
import type { DescMethod } from '@bufbuild/protobuf';
import { type IDisplayOptions, type INodeProperties, updateDisplayOptions } from 'n8n-workflow';
import { getTriggerPropertiesName, getTriggerUpdateName } from '../tools/stringUtils';
import { generateFieldParametersRecursively } from '../tools/generateFieldParametersRecursively';


export function generateTriggerParameters(destinationFile: GeneratedFile, method: DescMethod, useAdminClient: boolean, preamble: string): void {
	if (['client_streaming', 'unary', "bidi_streaming"].includes(method.methodKind)) {
		throw new Error(`#--# GENERATION ERROR: unsupported method kind and no override file was found in overrides directory [method: ${method.name}, service "${method.parent.name}]"`);
	}

	/*
	** imports
	*/
	destinationFile.print(preamble);
	destinationFile.print`
/* eslint-disable n8n-nodes-base/node-param-display-name-miscased-id,n8n-nodes-base/node-param-collection-type-unsorted-items,n8n-nodes-base/node-param-type-options-password-missing,n8n-nodes-base/node-param-required-false,n8n-nodes-base/node-param-options-type-unsorted-items */
import { type INodeProperties } from 'n8n-workflow';
`

	/*
	** generate trigger properties
	 */
	// we ignore count parameter in triggers cause it's useless in n8n
	let properties: INodeProperties[] = method.input.fields.filter(f => f.name !== "count").flatMap(f => {return generateFieldParametersRecursively(f, [], !f.proto.proto3Optional && f.fieldKind !== "list")});

	// update display options: make properties only visible for this update property
	const displayOptions: IDisplayOptions = {
		show: {
			updates: [getTriggerUpdateName(method)],
		},
	};
	properties = updateDisplayOptions(displayOptions, properties)

	destinationFile.print`
export const ${getTriggerPropertiesName(method)}: INodeProperties[] = ${JSON.stringify(properties, null, 2).replace(/"([^"]+)":/g, '$1:').replace(/"/g, "'")};
`;
}
