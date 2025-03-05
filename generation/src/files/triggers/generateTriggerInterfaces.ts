import type { GeneratedFile } from "@bufbuild/protoplugin"
import type { ResourceOperationListType } from "../../tools/types";
import { decapitalize } from "src/tools/tools";

export function generateTriggerInterfaces(f: GeneratedFile, resourceOperationList: ResourceOperationListType): void {
    for (const resource in resourceOperationList) {
        for (const operation of resourceOperationList[resource]) {
            f.print`import { ${decapitalize(operation)} } from "./${resource}/on${operation}.event";`;
        }
    }
    f.print`
export const LISTENER_TYPES = {`;
    for (const resource in resourceOperationList) {
        for (const operation of resourceOperationList[resource]) {
            f.print`    ${operation.toUpperCase()}: '${decapitalize(operation)}',`;
        }
    }
    f.print`} as const;

export const listenerMap = {`;
    for (const resource in resourceOperationList) {
        for (const operation of resourceOperationList[resource]) {
            f.print`    [LISTENER_TYPES.${operation.toUpperCase()}]: ${decapitalize(operation)},`;
        }
    }
    f.print`};

export type ListenerType = typeof LISTENER_TYPES[keyof typeof LISTENER_TYPES]`;
}
