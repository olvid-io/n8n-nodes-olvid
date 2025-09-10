import type { Schema } from '@bufbuild/protoplugin';
import type { DescMethod, DescService } from '@bufbuild/protobuf';
import { overrideTriggerFile } from './overrides/overrideFile';
import { generateTrigger } from './triggers/generateTrigger';
import { generateTriggersCommonProperties } from './triggers/generateTriggersCommonProperties';
import { generateTriggersMap } from './triggers/generateTriggersMap';

export default function generateTriggerFiles(schema: Schema, services: DescService[], preamble: string, useAdminClient: boolean) {
	const methods: DescMethod[] = services.flatMap(s => s.methods);
	// generateAction trigger handler and properties
	for (const method of methods) {
		const isOverwritten = overrideTriggerFile(schema, method);
		if (!isOverwritten) {
			generateTrigger(schema, method, useAdminClient);
		}
	}

	// generateAction trigger structure nodes
	// Trigger Resource Description
	const triggerResourceDescriptionFile = schema.generateFile('triggers/generatedProperties.ts');
	triggerResourceDescriptionFile.print(preamble);
	generateTriggersCommonProperties(triggerResourceDescriptionFile, services);

	// generateAction trigger router map
	const routerMapFile = schema.generateFile('triggers/routerMap.ts');
	routerMapFile.print(preamble);
	generateTriggersMap(routerMapFile, services, useAdminClient);
}
