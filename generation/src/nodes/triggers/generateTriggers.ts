import type { Schema } from '@bufbuild/protoplugin';
import type { DescMethod, DescService } from '@bufbuild/protobuf';
import { overrideTriggerFile } from '../overrides/overrideFile';
import { generateTriggerParameters } from './generateTriggerParameters';
import { generateTriggersCommonProperties } from './generateTriggersCommonProperties';
import { getTriggerFileName } from '../tools/stringUtils';

export default function generateTriggers(schema: Schema, services: DescService[], preamble: string, useAdminClient: boolean) {
	const methods: DescMethod[] = services.flatMap(s => s.methods);
	// generateAction trigger handler and properties
	for (const method of methods) {
		const isOverwritten = overrideTriggerFile(schema, method);
		if (!isOverwritten) {
			const triggerResourcesFile = schema.generateFile(`triggers/${method.parent.name}/${getTriggerFileName(method)}`);
			generateTriggerParameters(triggerResourcesFile, method, useAdminClient, preamble);
		}
	}

	// generateAction trigger structure nodes
	// Trigger Resource Description
	const triggerResourceDescriptionFile = schema.generateFile('triggers/generatedProperties.ts');
	triggerResourceDescriptionFile.print(preamble);
	generateTriggersCommonProperties(triggerResourceDescriptionFile, services);
}
