import type { GeneratedFile } from "@bufbuild/protoplugin"
import type { DescMethod, DescService } from '@bufbuild/protobuf';
import { decapitalize } from '../../tools/tools';

export function generateTriggerProperties(f: GeneratedFile, triggerServices: DescService[]): void {
	// global import
	f.print`
/* eslint-disable n8n-nodes-base/node-param-options-type-unsorted-items */
import type { INodeProperties } from 'n8n-workflow';\n`

	// import operation properties (parameters for example)
	f.print`// import operation properties
${triggerServices.flatMap(s => s.methods).map(m => `import { ${decapitalize(m.name)}Properties } from "./${m.parent.name}/on${m.name}.event"`).join("\n")}`

	// comments and help
	f.print`
// in Node description we describe node resources and operations, each one is a INodeProperties with type resource or operation
// resource represents services: ex MessageNotificationService
// operation represents methods : ex onMessageReceived\n`

	// variable declaration
	f.print`export const generatedProperties: INodeProperties[] = [`

	// resources descriptions: all services are mapped to resources in one resource node
	f.print`  // resources description (grpc services)
  {
  	displayName: 'Trigger on',
  	name: 'updates',
  	type: 'options',
  	required: true,
  	options: [
${triggerServices.flatMap((s: DescService) => s.methods).map((m: DescMethod) => `      {name: '${m.name}', value: '${m.name}'}`).join(",\n")}
  	],
  	// Hardcoded in code generation
  	default: 'MessageReceived'
	},

	// hardcoded property in code generation (common to every operation)
	{
		displayName: 'Dry Run for with example data [WARNING: WIP]',
		name: 'mockData',
		type: 'boolean',
		// isNodeSetting: true,
		default: false,
		description: 'Use mock data for "Test step" to test the workflow without connecting to Olvid daemon',
	},

	// include operations properties
${triggerServices.flatMap(s => s.methods).map((m: DescMethod) => `  ...${decapitalize(m.name)}Properties`).join(",\n")}`

	// variable declaration end
	f.print`]`
}
