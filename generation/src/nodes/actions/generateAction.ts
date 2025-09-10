import type { Schema } from "@bufbuild/protoplugin"

import type { DescMethod } from "@bufbuild/protobuf"
import { generateActionPropertiesJson } from "../properties/generateActionPropertiesJson";
import { decapitalize } from "src/tools/tools";
import { generateActionHandler } from "./generateActionHandler";

export function generateAction(schema: Schema, method: DescMethod, useAdminClient: boolean = false): void {
	if (method.methodKind === 'client_streaming' || method.methodKind === "bidi_streaming") {
		throw new Error(`#--# GENERATION ERROR: Client streaming and bidirectional streaming not supported and no override file was found in overrides directory [method: ${method.name}, service "${method.parent.name}]"`);
	}

	const path = `actions/${method.parent.name}/${decapitalize(method.name)}`;
	const destinationFile = schema.generateFile(`${path}.operation.ts`);

	/*
	** imports
	*/
	destinationFile.preamble(method.parent.file);
	destinationFile.print`
// noinspection ES6UnusedImports
import { type IExecuteFunctions, type INodeExecutionData, type IDataObject, type INodeProperties, updateDisplayOptions } from 'n8n-workflow';

// noinspection ES6UnusedImports
import { Olvid${useAdminClient ? 'Admin' : ''}Client } from '../../../../../client/Olvid${useAdminClient ? 'Admin' : ''}Client';
// noinspection ES6UnusedImports
import * as datatypes from '../../../../../protobuf/olvid/daemon/datatypes/v1/datatypes';
// noinspection ES6UnusedImports
${!useAdminClient ? 'import * as commands from "../../../../../protobuf/olvid/daemon/command/v1/command";' : ''}
// noinspection ES6UnusedImports
${useAdminClient ? 'import * as admin from "../../../../../protobuf/olvid/daemon/admin/v1/admin";' : ''}
// noinspection ES6UnusedImports
import { create } from '@bufbuild/protobuf';
`
	generateActionPropertiesJson(destinationFile, method);

	generateActionHandler(destinationFile, method, useAdminClient);
}
