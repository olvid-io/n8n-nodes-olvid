import type { DescField, DescOneof } from '@bufbuild/protobuf';
import type { DescMethod, DescService } from '@bufbuild/protobuf';

export function capitalize(input: string): string {
    return input.charAt(0).toUpperCase() + input.slice(1);
}

export function decapitalize(input: string): string {
    return input.charAt(0).toLowerCase() + input.slice(1);
}

export function getActionResourceName(service: DescService): string {
	return service.name;
}
export function getActionOperationName(method: DescMethod): string {
	return method.name;
}
// action.action is the description of this action (set in operation property)
export function getActionOperationAction(method: DescMethod): string {
	return method.name.charAt(0).toUpperCase() + method.name.slice(1).replace(/[A-Z]/g, letter => ` ${letter.toLowerCase()}`).trim();
}
export function getActionFileName(method: DescMethod): string {
	return `${decapitalize(method.name)}.operation.ts`;
}
export function getActionFilePath(method: DescMethod): string {
	return `${method.parent.name}/${getActionFileName(method)}`;
}
export function getActionImportFilePath(method: DescMethod): string {
	// remove .ts extension
	return `${method.parent.name}/${getActionFileName(method).slice(0, -3)}`;
}

export function getActionHandlerFunctionName(method: DescMethod): string {
	return decapitalize(method.name);
}
export function getActionPropertiesName(method: DescMethod): string {
	return `${decapitalize(method.name)}Properties`;
}

// equivalent to getActionOperationName
export function getTriggerUpdateName(method: DescMethod): string {
	return method.name;
}
export function getTriggerFileName(method: DescMethod): string {
	return `on${method.name}.event.ts`;
}
export function getTriggerFilePath(method: DescMethod): string {
	return `${method.parent.name}/${getTriggerFileName(method)}`;
}
export function getTriggerImportFilePath(method: DescMethod): string {
	// remove .ts extension
	return `${method.parent.name}/${getTriggerFileName(method).slice(0, -3)}`;
}
export function getTriggerHandlerFunctionName(method: DescMethod): string {
	return decapitalize(method.name);
}
export function getTriggerPropertiesName(method: DescMethod): string {
	return `${decapitalize(method.name)}Properties`;
}


/*
 ** common to action and triggers
 */
// access to a stub of OlvidClient / OlvidAdminClient (returns: client.stubs.identityCommandStub)
export function getStub(method: DescMethod, clientName: string = "client"): string {
	if (method.parent.name.endsWith("AdminService"))
		return `${clientName}.adminStubs.${decapitalize(method.parent.name.replace('AdminService', 'AdminStub'))}`;
	else
		return `${clientName}.stubs.${decapitalize(method.parent.name.replace('Service', 'Stub'))}`;
}

// common oneof methods
export function getOneofFieldSelectorDisplayName(oneof: DescOneof): string {
	return capitalize(oneof.localName);
}
export function getOneofFieldOptionName(field: DescField, oneof: DescOneof): string {
	return `${capitalize(oneof.localName)} - ${capitalize(field.localName)}`;
}
export function getOneofFieldSelectorName(oneof: DescOneof): string {
	// TODO remove Select ?
	return `${oneof.localName}Select`;
}
