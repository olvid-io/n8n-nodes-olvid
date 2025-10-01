import type { Schema } from '@bufbuild/protoplugin';
import type { DescService } from '@bufbuild/protobuf';
import { overrideActionFile } from '../overrides/overrideFile';
import { generateActionParameters } from './generateActionParameters';
import { generateActionsCommonProperties } from './generateActionsCommonProperties';
import { getActionFileName } from '../tools/stringUtils';

export default function generateActions(schema: Schema, services: DescService[], preamble: string, useAdminClient: boolean) {
	for (const method of services.flatMap(s => s.methods)) {
		// generateAction action handler and properties if not already in an override file
		const isOverwritten = overrideActionFile(schema, method);
		if (!isOverwritten) {
			const actionResourcesFile = schema.generateFile(`actions/${method.parent.name}/${getActionFileName(method)}`);
			generateActionParameters(actionResourcesFile, method, useAdminClient, preamble);
		}
	}

	// generateAction actions properties
	const resourceDescriptionFile = schema.generateFile('actions/generatedProperties.ts');
	resourceDescriptionFile.print(preamble);
	generateActionsCommonProperties(resourceDescriptionFile, services);
}
