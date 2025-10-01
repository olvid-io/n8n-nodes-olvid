import type { GeneratedFile } from '@bufbuild/protoplugin';

import type { DescMethod } from "@bufbuild/protobuf"
import  {type IDisplayOptions, type INodeProperties, updateDisplayOptions} from "n8n-workflow";
import { generateFieldParametersRecursively } from '../tools/generateFieldParametersRecursively';
import {
  getActionOperationName,
  getActionPropertiesName,
  getActionResourceName,
} from '../tools/stringUtils';

export function generateActionParameters(destinationFile: GeneratedFile, method: DescMethod, useAdminClient: boolean, preamble: string): void {
	if (['client_streaming', "bidi_streaming"].includes(method.methodKind)) {
		throw new Error(`#--# GENERATION ERROR: Client streaming and bidirectional streaming not supported and no override file was found in overrides directory [method: ${method.name}, service "${method.parent.name}]"`);
	}

	/*
	** imports
	*/
	destinationFile.print(preamble);
	destinationFile.print`
/* eslint-disable n8n-nodes-base/node-param-display-name-miscased-id,n8n-nodes-base/node-param-collection-type-unsorted-items,n8n-nodes-base/node-param-type-options-password-missing,n8n-nodes-base/node-param-required-false,n8n-nodes-base/node-param-options-type-unsorted-items */
import { type INodeProperties } from 'n8n-workflow';
`

	let properties: INodeProperties[] = method.input.fields.flatMap(f => {return generateFieldParametersRecursively(f, [], !f.proto.proto3Optional && f.fieldKind !== "list")});

	// update display options: make properties only visible for this resource and operation combination
	const displayOptions: IDisplayOptions = {
		show: {
			resource: [getActionResourceName(method.parent)],
			operation: [getActionOperationName(method)],
		},
	};
	properties = updateDisplayOptions(displayOptions, properties)

	destinationFile.print`
export const ${getActionPropertiesName(method)}: INodeProperties[] = ${JSON.stringify(properties, null, 2).replace(/"([^"]+)":/g, '$1:').replace(/"/g, "'")};
`;
}
