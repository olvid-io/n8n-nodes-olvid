import type { GeneratedFile } from "@bufbuild/protoplugin"
import type { DescMethod, DescService } from '@bufbuild/protobuf';
import {
	getActionOperationAction, getActionImportFilePath, getActionOperationName, getActionPropertiesName,
	getActionResourceName,
} from '../tools/tools';

export function generateActionsCommonProperties(f: GeneratedFile, services: DescService[]): void {
	// global import
	f.print`
/* eslint-disable n8n-nodes-base/node-param-options-type-unsorted-items */
import type { INodeProperties } from 'n8n-workflow';\n`

	// import each method properties: these properties contains method parameters description
	f.print`// import operation properties
${services.flatMap(s => s.methods).map(m => `import { ${getActionPropertiesName(m)} } from "./${getActionImportFilePath(m)}"`).join("\n")}
`

	f.print`// list of properties (INodeProperties) representing different aspect of our node
// - list all the possible actions ordered by resources (grpc service) and operation (grpc method)
// - declare parameters common to every action (hardcoded)
// - include every action properties containing their parameters (these parameters are generated in trigger file)
export const generatedProperties: INodeProperties[] = [`

	// resources property
	f.print`  // resources (group of operations corresponding to grpc services)
  {
		displayName: 'Resource',
		name: 'resource',
		type: 'options',
		noDataExpression: true,
		options: [
${services.map(s => `      {name: '${getActionResourceName(s)}', value: '${getActionResourceName(s)}'}`).join(',\n')}
		],
		default: "${getActionResourceName(services[0])}"
	},`

	// operations properties: one operation property for each resource, containing every method (ex: resource: MessageCommandService, Operation: MessageSend, MessageList, ...)
	for (const s of services) {
f.print`  // operation for ${getActionResourceName(s)}
  {
    displayName: 'Operation',
    name: 'operation',
    type: 'options',
    noDataExpression: true,
    displayOptions: {
      show: {
        resource: ['${getActionResourceName(s)}'],
      },
		},
		options: [
${s.methods.map(m => `      {name: "${getActionOperationName(m)}", value: "${getActionOperationName(m)}", action: "${getActionOperationAction(m)}"}`).join(',\n')}
		],
		default: "${getActionOperationName(s.methods[0])}"
	},`
	}

	// include trigger properties (containing trigger parameters)
	f.print`
${services.flatMap(s => s.methods).map((m: DescMethod) => `  ...${getActionPropertiesName(m)}`).join(",\n")}`

	// variable declaration end
	f.print`]`
}
