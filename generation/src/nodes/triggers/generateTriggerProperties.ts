import type { GeneratedFile } from "@bufbuild/protoplugin"
import type { DescMethod, DescService } from '@bufbuild/protobuf';
import {
	getTriggerImportFilePath,
	getTriggerPropertiesName, getTriggerUpdateName,
} from '../../tools/tools';

export function generateTriggerProperties(f: GeneratedFile, triggerServices: DescService[]): void {
	// global import
	f.print`
/* eslint-disable n8n-nodes-base/node-param-options-type-unsorted-items */
import type { INodeProperties } from 'n8n-workflow';\n`

	// import each method properties: these properties contains method parameters description
	f.print`// import operation properties
${triggerServices.flatMap(s => s.methods).map(m => `import { ${getTriggerPropertiesName(m)} } from "./${getTriggerImportFilePath(m)}"`).join("\n")}\n`

	f.print`
// list of properties (INodeProperties) representing different aspect of our node
// - list all the possible triggers in property "updated"
// - declare parameters common to every trigger
// - include every trigger properties containing it's parameters (these parameters are generated in trigger file)
export const generatedProperties: INodeProperties[] = [`
	// resources descriptions: all services are mapped to resources in one resource node
	f.print`  // trigger methods list (grpc methods)
  {
  	displayName: 'Trigger on',
  	name: 'updates',
  	type: 'options',
  	required: true,
  	options: [
${triggerServices.flatMap((s: DescService) => s.methods).map((m: DescMethod) => `      {name: '${getTriggerUpdateName(m)}', value: '${getTriggerUpdateName(m)}'}`).join(",\n")}
  	],
  	default: '${getTriggerUpdateName(triggerServices.flatMap(s => s.methods)[0])}'
	},`

	// TODO rename / change
	// common parameters
	f.print`	// hardcoded property in code generation (common to every operation)
	{
		displayName: 'Dry Run for with example data [WARNING: WIP]',
		name: 'mockData',
		type: 'boolean',
		// isNodeSetting: true,
		default: false,
		description: 'Use mock data for "Test step" to test the workflow without connecting to Olvid daemon',
	},`

	// include trigger properties (containing trigger parameters)
	f.print`
${triggerServices.flatMap(s => s.methods).map((m: DescMethod) => `  ...${getTriggerPropertiesName(m)}`).join(",\n")}`

	// variable declaration end
	f.print`]`
}
