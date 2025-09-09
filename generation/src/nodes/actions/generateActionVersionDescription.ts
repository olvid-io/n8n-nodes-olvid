import type { GeneratedFile } from "@bufbuild/protoplugin"
import type { ResourceOperationListType } from "../../tools/types";

export function generateActionVersionDescription(f: GeneratedFile, resourceOperationList: ResourceOperationListType): void {
  const resourceStringList: string[] = Object.keys(resourceOperationList);
  f.print`
import { INodePropertyOptions, INodeProperties } from 'n8n-workflow';

${resourceStringList.map((resource) => `import * as ${resource} from './${resource}';`).join('\n')}

export const resourceOptionsList: INodePropertyOptions[] = [
${resourceStringList.map((resource) => `  {name: '${resource}', value: '${resource}'},`).join('\n')}
];

export const resourceDescriptions: INodeProperties[] = [
${resourceStringList.map((resource) => `  ...${resource}.descriptions,`).join('\n')}
];`;
}
