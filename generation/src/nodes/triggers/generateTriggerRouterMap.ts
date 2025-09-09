import type { GeneratedFile } from "@bufbuild/protoplugin"
import { decapitalize } from "src/tools/tools";
import type { DescMethod, DescService } from '@bufbuild/protobuf';

export function generateTriggerRouterMap(f: GeneratedFile, triggerMethods: DescMethod[]): void {
	// import every trigger main method that router will call
	// ex: import { invitationReceived } from "./InvitationNotificationService/onInvitationReceived.event";

	f.print(`import { ITriggerFunctions } from 'n8n-workflow';
import { OlvidClient } from '../../../../client/OlvidClient';
`)

	for (const method of triggerMethods) {
		f.print`import { ${decapitalize(method.name)} } from "./${method.parent.name}/on${method.name}.event";`;
	}
	f.print("")
	f.print("// this map allows to determine handler to use by router using the trigger name")

	f.print(`export const triggersMap: {[name: string]: (this: ITriggerFunctions, client: OlvidClient, onCallback?: Function, returnMockData?: boolean) => Function} = {
${triggerMethods.map((method) => `  "${method.name}": ${decapitalize(method.name)}`).join(",\n")}
}`);
}
