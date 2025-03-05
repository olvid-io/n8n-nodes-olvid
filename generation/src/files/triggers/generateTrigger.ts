import type { Schema } from "@bufbuild/protoplugin"
import type { DescMethod } from "@bufbuild/protoplugin/node_modules/@bufbuild/protobuf/dist/cjs/descriptors"
import {generateFunctionReturnObjectFromProtobufMessage} from "../../tools/generateProtobuf";

export function generateTrigger(schema: Schema, method: DescMethod, useAdminClient: boolean = false): void {
    const path = `triggers/${method.parent.name}/on${method.name}`;
    const destinationFile = schema.generateFile(`${path}.event.ts`);
	const stubName = method.parent.name.charAt(0).toLowerCase() + method.parent.name.slice(1).replace("Service", "Stub");

    destinationFile.preamble(method.parent.file);

	/*
	** imports
	 */
    destinationFile.print`import { ${useAdminClient ? 'OlvidAdminClient' : 'OlvidClient'}, notifications, datatypes } from '@olvid/bot-node';
import type { ITriggerFunctions } from 'n8n-workflow';`

	/*
	** function
	 */
	destinationFile.print`
export function ${method.localName}(this: ITriggerFunctions, client: ${useAdminClient ? 'OlvidAdminClient' : 'OlvidClient'}, onCallback?: Function, returnMockData: boolean = false): Function {
    if (returnMockData) {
        this.emit([this.helpers.returnJsonArray([{
${method.output.fields.map((subField) => `// ${subField.jsonName}.mockData`).join(',\n')}
        }])]);
        onCallback?.();
        return () => {};
    }

	const callback = (notification: notifications.${method.output.name}) => {
		this.emit([this.helpers.returnJsonArray(${generateFunctionReturnObjectFromProtobufMessage(method.output, "notification?.")})]);
		onCallback?.();
	}

	return client.stubs.${stubName}.${method.localName}({}, callback, () => {});
}`;
}
