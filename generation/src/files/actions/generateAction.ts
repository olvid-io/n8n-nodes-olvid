import type { Schema } from "@bufbuild/protoplugin"

import type { DescMethod } from "@bufbuild/protoplugin/node_modules/@bufbuild/protobuf/dist/cjs/descriptors"
import { generateActionPropertiesJson } from "../properties/generateActionPropertiesJson";
import { decapitalize } from "src/tools/tools";
import { generateActionExecuteFunction } from "./generateActionExecute";

export function generateAction(schema: Schema, method: DescMethod, useAdminClient: boolean = false): void {
	if (method.methodKind === 'client_streaming' || method.methodKind === "bidi_streaming") {
		throw new Error(`#--# GENERATION ERROR: Client streaming and bidirectional streaming not supported and no overrided file was found at "generation/src/overrides/${method.name}.operation.ts" for service "${method.parent.name}"`);
	}

	const path = `actions/${method.parent.name}/${decapitalize(method.name)}`;
	const destinationFile = schema.generateFile(`${path}.operation.ts`);

	/*
	** imports
	*/
	destinationFile.preamble(method.parent.file);
	destinationFile.print`import { type IExecuteFunctions, type INodeExecutionData, type IDataObject, type INodeProperties, updateDisplayOptions } from 'n8n-workflow';

// noinspection ES6UnusedImports
import { datatypes, Olvid${useAdminClient ? 'Admin' : ''}Client, ${useAdminClient ? 'admin' : 'commands'} } from '@olvid/bot-node';`

	/*
	** properties
	 */
	generateActionPropertiesJson(destinationFile, method);

	/*
	** execute
	 */
	generateActionExecuteFunction(destinationFile, method, useAdminClient);
}
