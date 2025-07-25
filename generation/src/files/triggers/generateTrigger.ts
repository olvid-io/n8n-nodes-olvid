import type { Schema } from '@bufbuild/protoplugin';
//@ts-ignore
import type { DescMethod, DescField } from '@bufbuild/protobuf/dist/cjs/descriptors';
import { generateFunctionReturnObjectFromProtobufMessage } from '../../tools/generateProtobuf';

/**
 * Map notification services to their corresponding filter types and parameter names
 */
function getFilterInfo(
	serviceName: string,
	methodName: string,
): { filterType: string; parameterName: string; builderFunction: string } | null {
	// Special cases for methods that don't support filters or have special parameter names
	const excludedMethods = [
		'GroupUpdateInProgress',
		'GroupUpdateFinished',
		// These are deprecated and don't support filters
	];

	if (excludedMethods.includes(methodName)) {
		return null;
	}

	// Special cases for methods with different parameter names
	if (serviceName === 'MessageNotificationService' && methodName === 'MessageReactionUpdated') {
		// This notification uses 'message_filter' instead of 'filter'
		return {
			filterType: 'datatypes.MessageFilter',
			parameterName: 'messageFilter',
			builderFunction: 'buildMessageFilter',
		};
	}

	switch (serviceName) {
		case 'MessageNotificationService':
			return {
				filterType: 'datatypes.MessageFilter',
				parameterName: 'filter',
				builderFunction: 'buildMessageFilter',
			};
		case 'AttachmentNotificationService':
			return {
				filterType: 'datatypes.AttachmentFilter',
				parameterName: 'filter',
				builderFunction: 'buildAttachmentFilter',
			};
		case 'ContactNotificationService':
			return {
				filterType: 'datatypes.ContactFilter',
				parameterName: 'filter',
				builderFunction: 'buildContactFilter',
			};
		case 'GroupNotificationService':
			return {
				filterType: 'datatypes.GroupFilter',
				parameterName: 'groupFilter', // Note: GroupNotificationService uses 'group_filter' in protobuf
				builderFunction: 'buildGroupFilter',
			};
		case 'DiscussionNotificationService':
			return {
				filterType: 'datatypes.DiscussionFilter',
				parameterName: 'filter',
				builderFunction: 'buildDiscussionFilter',
			};
		case 'InvitationNotificationService':
			return {
				filterType: 'datatypes.InvitationFilter',
				parameterName: 'filter',
				builderFunction: 'buildInvitationFilter',
			};
		case 'CallNotificationService':
			// CallNotificationService doesn't support filters
			return null;
		default:
			return null;
	}
}

export function generateTrigger(
	schema: Schema,
	method: DescMethod,
	useAdminClient: boolean = false,
): void {
	const path = `triggers/${method.parent.name}/on${method.name}`;
	const destinationFile = schema.generateFile(`${path}.event.ts`);
	const stubName =
		method.parent.name.charAt(0).toLowerCase() +
		method.parent.name.slice(1).replace('Service', 'Stub');
	const filterInfo = getFilterInfo(method.parent.name, method.name);

	destinationFile.preamble(method.parent.file);

	/*
	 ** imports
	 */
	destinationFile.print`import { ${useAdminClient ? 'OlvidAdminClient' : 'OlvidClient'} } from '../../../../../client/${useAdminClient ? 'OlvidAdminClient' : 'OlvidClient'}';
// noinspection ES6UnusedImports
import * as datatypes from '../../../../../protobuf/olvid/daemon/datatypes/v1/datatypes';
// noinspection ES6UnusedImports
import * as notifications from '../../../../../protobuf/olvid/daemon/notification/v1/notification';
// noinspection ES6UnusedImports
import type { ITriggerFunctions } from 'n8n-workflow';`;

	// Add filter helper import if this service supports filters
	if (filterInfo) {
		destinationFile.print`// noinspection ES6UnusedImports
import { ${filterInfo.builderFunction} } from '../../../../../common-methods/filterHelpers';`;
	}

	/*
	 ** function
	 */
	destinationFile.print`
export function ${method.localName}(this: ITriggerFunctions, client: ${useAdminClient ? 'OlvidAdminClient' : 'OlvidClient'}, onCallback?: Function, returnMockData: boolean = false): Function {
    if (returnMockData) {
        this.emit([this.helpers.returnJsonArray([{
${method.output.fields.map((subField: DescField) => `// ${subField.jsonName}.mockData`).join(',\n')}
        }])]);
        onCallback?.();
        return () => {};
    }`;

	// Add filter building logic if this service supports filters
	if (filterInfo) {
		destinationFile.print`
    // Build filter from trigger parameters
    const ${filterInfo.parameterName} = ${filterInfo.builderFunction}(this);`;
	}

	destinationFile.print`
	const callback = (notification: notifications.${method.output.name}) => {
		this.emit([this.helpers.returnJsonArray(${generateFunctionReturnObjectFromProtobufMessage(method.output, 'notification?.')})]);
		onCallback?.();
	}`;

	// Generate the client call with or without filter
	if (filterInfo) {
		destinationFile.print`
	return client.stubs.${stubName}.${method.localName}({ ${filterInfo.parameterName} }, callback, () => {});`;
	} else {
		destinationFile.print`
	return client.stubs.${stubName}.${method.localName}({}, callback, () => {});`;
	}

	destinationFile.print`
}`;
}
