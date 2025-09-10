import type { GeneratedFile } from "@bufbuild/protoplugin"
import {
	getActionHandlerFunctionName,
	getActionImportFilePath,
	getActionOperationName,
	getActionResourceName,
} from '../tools/tools';
import type { DescService } from '@bufbuild/protobuf';

export function generateActionsMap(f: GeneratedFile, services: DescService[], useAdminClient: boolean): void {
	// import every trigger main method that router will call
	// ex: import { invitationReceived } from "./InvitationNotificationService/onInvitationReceived.event";

	f.print(`import { IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';
import { ${useAdminClient ? 'OlvidAdminClient' : 'OlvidClient'} } from '../../../../client/${useAdminClient ? 'OlvidAdminClient' : 'OlvidClient'}';
`)

	f.print("// import every action handler function")
	for (const method of services.flatMap(s => s.methods)) {
		f.print`import { ${getActionHandlerFunctionName(method)} } from "./${getActionImportFilePath(method)}";`;
	}
	f.print("")
	f.print("// this map allows to determine handler to use by router using the action resource and operation")

	f.print`export const actionMap: {[resource: string]: {[operation: string]: (this: IExecuteFunctions, index: number, client: ${useAdminClient ? 'OlvidAdminClient' : 'OlvidClient'}) => Promise<INodeExecutionData[]>}} = {`

	for (const s of services) {
		f.print`  "${getActionResourceName(s)}": {
${s.methods.map((m) => `    "${getActionOperationName(m)}": ${getActionHandlerFunctionName(m)}`).join(',\n')}
  },`;
	}

	f.print`}`;
}
