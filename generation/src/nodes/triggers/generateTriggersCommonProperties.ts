import type { GeneratedFile } from "@bufbuild/protoplugin"
import type { DescMethod, DescService } from '@bufbuild/protobuf';
import {
	getTriggerImportFilePath,
	getTriggerPropertiesName, getTriggerUpdateName,
} from '../tools/stringUtils';
import type {INodeProperties} from "n8n-workflow";

export function generateTriggersCommonProperties(f: GeneratedFile, services: DescService[]): void {
	// global import
	f.print`
/* eslint-disable n8n-nodes-base/node-param-options-type-unsorted-items */
import type { INodeProperties } from 'n8n-workflow';\n`

	// import each method properties: these properties contains method parameters description
	f.print`// import operation properties
${services.flatMap(s => s.methods).map(m => `import { ${getTriggerPropertiesName(m)} } from "./${getTriggerImportFilePath(m)}"`).join("\n")}\n`

	const generatedProperties: INodeProperties[] = [
		// trigger methods list (grpc methods)
		{
			displayName: 'Trigger on',
			name: 'updates',
			type: 'options',
			required: true,
			options: [
				...services.flatMap((s: DescService) => s.methods).map((m: DescMethod) => { return {name: getTriggerUpdateName(m), value: getTriggerUpdateName(m)}})
			],
			default: getTriggerUpdateName(services.flatMap(s => s.methods)[0])
		},
	];

	f.print`// list of properties (INodeProperties) representing different aspect of our node
// - list all the possible triggers in property "updated"
// - declare parameters common to every trigger (hardcoded)
// - include every trigger properties containing their parameters (these parameters are generated in trigger file)
export const generatedProperties: INodeProperties[] = ${JSON.stringify(generatedProperties, null, 2)};

// include trigger properties (containing trigger parameters)
generatedProperties.push(
${services.flatMap(s => s.methods).map((m: DescMethod) => `  ...${getTriggerPropertiesName(m)}`).join(",\n")}
);`
}
