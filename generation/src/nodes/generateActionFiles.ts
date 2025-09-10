import type { Schema } from '@bufbuild/protoplugin';
import type { DescService } from '@bufbuild/protobuf';
import { overrideActionFile } from './overrides/overrideFile';
import { generateAction } from './actions/generateAction';
import { generateActionsCommonProperties } from './actions/generateActionsCommonProperties';
import { generateActionsMap } from './actions/generateActionsMap';

export default function generateActionFiles(schema: Schema, services: DescService[], preamble: string, useAdminClient: boolean) {
	for (const method of services.flatMap(s => s.methods)) {
		// generateAction action handler and properties if not already in an override file
		const isOverwritten = overrideActionFile(schema, method);
		if (!isOverwritten) {
			generateAction(schema, method, useAdminClient);
		}
	}

	// generateAction actions properties
	const resourceDescriptionFile = schema.generateFile('actions/generatedProperties.ts');
	resourceDescriptionFile.print(preamble);
	generateActionsCommonProperties(resourceDescriptionFile, services);

	// generateAction action router map
	const routerMapFile = schema.generateFile('actions/routerMap.ts');
	routerMapFile.print(preamble);
	generateActionsMap(routerMapFile, services, useAdminClient);
}
