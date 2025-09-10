import type { GeneratedFile } from "@bufbuild/protoplugin"
import {
	getTriggerHandlerFunctionName,
	getTriggerImportFilePath,
	getTriggerUpdateName,
} from '../tools/tools';
import type { DescService } from '@bufbuild/protobuf';

export function generateTriggersMap(f: GeneratedFile, services: DescService[], useAdminClient: boolean): void {
	// import every trigger main method that router will call
	// ex: import { invitationReceived } from "./InvitationNotificationService/onInvitationReceived.event";

	f.print(`import { ITriggerFunctions } from 'n8n-workflow';
import { ${useAdminClient ? 'OlvidAdminClient' : 'OlvidClient'} } from '../../../../client/${useAdminClient ? 'OlvidAdminClient' : 'OlvidClient'}';
`)

	for (const method of services.flatMap(s => s.methods)) {
		f.print`import { ${getTriggerHandlerFunctionName(method)} } from "./${getTriggerImportFilePath(method)}";`;
	}
	f.print("")
	f.print("// this map allows to determine handler to use by router using the trigger name")

	f.print(`export const triggersMap: {[name: string]: (this: ITriggerFunctions, client: ${useAdminClient ? 'OlvidAdminClient' : 'OlvidClient'}, onCallback?: Function, returnMockData?: boolean) => Function} = {
${services.flatMap(s => s.methods).map(m => `  "${getTriggerUpdateName(m)}": ${getTriggerHandlerFunctionName(m)}`).join(",\n")}
}`);
}
