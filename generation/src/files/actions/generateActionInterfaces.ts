import type { GeneratedFile } from "@bufbuild/protoplugin"
import type { ResourceOperationListType } from "../../tools/types";

export function generateActionInterfaces(f: GeneratedFile, resourceOperationList: ResourceOperationListType): void {
    f.print`
import type { AllEntities, Entity, PropertiesOf } from 'n8n-workflow';

type OlvidMap = {`;
    for (const resource in resourceOperationList) {
        f.print`    ${resource}: '${resourceOperationList[resource].map(operation => `${operation}`).join('\' | \'')}';`;
    }
    f.print`};

export type Olvid = AllEntities<OlvidMap>;

${Object.keys(resourceOperationList).map(resource => `export type Olvid${resource} = Entity<OlvidMap, '${resource}'>;`).join('\n')}

${Object.keys(resourceOperationList).map(resource => `export type ${resource}Properties = PropertiesOf<Olvid${resource}>;`).join('\n')}`;
}
