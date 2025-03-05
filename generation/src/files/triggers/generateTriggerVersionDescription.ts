import type { GeneratedFile } from "@bufbuild/protoplugin"
import type { ResourceOperationListType } from "../../tools/types";

export function generateTriggerVersionDescription(f: GeneratedFile, resourceOperationList: ResourceOperationListType): void {
  const resourceStringList: string[] = Object.keys(resourceOperationList);
  f.print`
import type { INodePropertyOptions } from 'n8n-workflow';
import { LISTENER_TYPES } from './generatedInterfaces';

export const generatedDescriptions: INodePropertyOptions[] = [`;
  for (const resource of resourceStringList) {
    for (const operation of resourceOperationList[resource]) {
      f.print`  { name: '${operation}', value: LISTENER_TYPES.${operation.toUpperCase()} },`;
    }
  }
  f.print`
];`;
}
