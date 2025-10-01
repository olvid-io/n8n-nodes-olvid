import type { GeneratedFile } from "@bufbuild/protoplugin"
import type { DescMethod, DescService } from '@bufbuild/protobuf';
import {
	getActionOperationAction, getActionImportFilePath, getActionOperationName, getActionPropertiesName,
	getActionResourceName,
} from '../tools/stringUtils';
import type {INodeProperties, NodePropertyTypes} from "n8n-workflow";

export function generateActionsCommonProperties(f: GeneratedFile, services: DescService[]): void {
	// global import
	f.print`
/* eslint-disable n8n-nodes-base/node-param-options-type-unsorted-items */
import type { INodeProperties } from 'n8n-workflow';\n`

	// import each method properties: these properties contains method parameters description
	f.print`// import operation properties
${services.flatMap(s => s.methods).map(m => `import { ${getActionPropertiesName(m)} } from "./${getActionImportFilePath(m)}"`).join("\n")}
`

	const generatedProperties: INodeProperties[] = [
		// resources (group of operations corresponding to grpc services)
		{
			displayName: 'Resource',
			name: 'resource',
			type: 'options',
			noDataExpression: true,
			options: [
				...services.map((s: DescService) => {
					return {name: getActionResourceName(s), value: getActionResourceName(s)}
				})
			],
			default: getActionResourceName(services[0])
		},
		// operations properties: one operation property for each resource, containing every method (ex: resource: MessageCommandService, Operation: MessageSend, MessageList, ...)
		...services.map(s => {
			return {
				displayName: 'Operation',
				name: 'operation',
				type: 'options' as NodePropertyTypes,
				noDataExpression: true,
				description: s.name,
				displayOptions: {
					show: {
						resource: [getActionResourceName(s)],
					},
				},
				options: [
					...s.methods.map(m => {
						return {
							name: getActionOperationName(m),
							value: getActionOperationName(m),
							action: getActionOperationAction(m)
						}
					})
				],
				default: getActionOperationName(s.methods[0])
			}
		})
	];

	f.print`// list of properties (INodeProperties) representing different aspect of our node
// - list all the possible actions ordered by resources (grpc service) and operation (grpc method)
// - declare parameters common to every action (hardcoded)
// - include every action properties containing their parameters (these parameters are generated in trigger file)
export const generatedProperties: INodeProperties[] = ${JSON.stringify(generatedProperties, null, 2)};

// include action properties (containing action parameters)
generatedProperties.push(
${services.flatMap(s => s.methods).map((m: DescMethod) => `  ...${getActionPropertiesName(m)}`).join(",\n")}
);
`;
}
