import type { GeneratedFile } from "@bufbuild/protoplugin";
//@ts-ignore
import type { DescMethod } from "@bufbuild/protobuf/dist/cjs/descriptors"
import { generateTriggerGetParameterRecursive } from "./parameters/generateTriggerGetParameterRecursive";
import { getDefaultGetParameter } from "./parameters/getDefaultGetParameter";
import { generateFunctionReturnObjectFromProtobufMessage } from "../../tools/generateProtobuf";
import type { DescField } from '@bufbuild/protobuf';

export function generateTriggerHandler(destinationFile: GeneratedFile, method: DescMethod, useAdminClient: boolean): void {
	const stubName = method.parent.name.charAt(0).toLowerCase() + method.parent.name.slice(1).replace("Service", "Stub");

	destinationFile.print`
export function ${method.localName}(this: ITriggerFunctions, client: ${useAdminClient ? 'OlvidAdminClient' : 'OlvidClient'}, onCallback?: Function, returnMockData: boolean = false): Function {`;

	for (const subField of method.input.fields) {
		generateTriggerGetParameterRecursive(destinationFile, subField, 0);
		destinationFile.print`    ${getDefaultGetParameter({ field: subField })}`;
	}

	destinationFile.print`
    if (returnMockData) {
        this.emit([this.helpers.returnJsonArray([{
${method.output.fields.map((subField: DescField) => `// ${subField.jsonName}.mockData`).join(',\n')}
        }])]);
        onCallback?.();
        return () => {};
    }`;

	destinationFile.print`
	const callback = (notification: notifications.${method.output.name}) => {
		this.emit([this.helpers.returnJsonArray(${generateFunctionReturnObjectFromProtobufMessage(method.output, 'notification?.')})]);
		onCallback?.();
	}`;

	destinationFile.print`
	return client.stubs.${stubName}.${method.localName}({${method.input.fields.map((subField: DescField) => `${subField.jsonName}`).join(', ')}}, callback, () => {});`;

	destinationFile.print`
}`;
}
