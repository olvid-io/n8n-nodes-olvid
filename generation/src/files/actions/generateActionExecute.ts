import type { GeneratedFile } from "@bufbuild/protoplugin";
import type { DescMethod } from "@bufbuild/protoplugin/node_modules/@bufbuild/protobuf/dist/cjs/descriptors"
import { generateActionGetParameterRecursive } from "./parameters/generateActionGetParameterRecursive";
import { getDefaultGetParameter } from "./parameters/getDefaultGetParameter";
import { generateFunctionReturnObjectFromProtobufMessage } from "../../tools/generateProtobuf";

export function generateActionExecuteFunction(destinationFile: GeneratedFile, method: DescMethod, useAdminClient: boolean): void {
	const stubName = method.parent.name.charAt(0).toLowerCase() + method.parent.name.slice(1).replace("Service", "Stub");

	destinationFile.print`
export async function execute(this: IExecuteFunctions, index: number, client: ${useAdminClient ? 'OlvidAdminClient' : 'OlvidClient'}): Promise<INodeExecutionData[]> {`;

	for (const subField of method.input.fields) {
		generateActionGetParameterRecursive(destinationFile, subField, 0);
		destinationFile.print`    ${getDefaultGetParameter({ field: subField })}`;
	}
	const parameters = method.input.fields.map((subField) => `${subField.jsonName}`).join(', ');

	/*
	** server streaming
	 */
	if (method.methodKind === 'server_streaming') {
		if (!method.name.endsWith("List")) {
			throw new Error(`#--# GENERATION ERROR: generateAction: not implemented: server_streaming not for list entry points: ${method.name}, you must extend generation code\n${method}"`)
		}
		/*
		** list specific RPCs
		 */
		else {
			let addMessageElementToContainer: string = "";
			for (let field of method.output.fields) {
				if (field.fieldKind === "list") {
					addMessageElementToContainer += `        containerMessage.${field.localName}.push(...message.${field.localName});\n`;
				}
				// if field is not the main repeated field we just use the last field value (keycloakContactList case)
				else {
					addMessageElementToContainer += `        containerMessage.${field.localName} = message.${field.localName}\n`;
				}
			}

			destinationFile.print`
    const containerMessage: ${useAdminClient ? 'admin' : 'commands'}.${method.output.name} = new ${useAdminClient ? 'admin' : 'commands'}.${method.output.name}();
    for await (const message of client.${useAdminClient ? 'adminStubs' : 'stubs'}.${stubName}.${method.localName}({${parameters}})) {
${addMessageElementToContainer.trimEnd()}
    }

    return this.helpers.returnJsonArray(${generateFunctionReturnObjectFromProtobufMessage(method.output, "containerMessage?.")});
}`;
		}
	}

	/*
	** unary
	 */
	else if (method.methodKind === "unary") {
		destinationFile.print`    const response: ${useAdminClient ? 'admin' : 'commands'}.${(method.output.name)} = await client.${useAdminClient ? 'adminStubs' : 'stubs'}.${stubName}.${method.localName}({${parameters}});
    return this.helpers.returnJsonArray(${generateFunctionReturnObjectFromProtobufMessage(method.output, "response?.")});
}`;
	}
}
