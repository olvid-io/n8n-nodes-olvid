import type { Schema } from "node_modules/@bufbuild/protoplugin/dist/cjs";
import { readFileSync } from 'fs';
import * as path from 'path';
import { decapitalize } from '../tools/tools';
//@ts-ignore
import type { DescMethod } from "@bufbuild/protobuf/dist/cjs/descriptors"

export function overrideFile(schema: Schema, fileList: string[], method: DescMethod, directoryName: string): boolean {
    const actionFileName = `${decapitalize(method.name)}.operation.ts`;
    const triggerFileName = `on${method.name}.event.ts`;
    const fileNames = [actionFileName, triggerFileName];

    for (const fileName of fileNames) {
        const sourceFilePath = path.join(__dirname, "overrides", fileName);
        const destinationFilePath = path.join(directoryName, method.parent.name, fileName);
        if (fileList.includes(fileName)) {
            const destinationFile = schema.generateFile(destinationFilePath);
            destinationFile.print(`// Copied from: ${path.join('overrides', fileName)}`);
            destinationFile.print(readFileSync(sourceFilePath, 'utf8'));
            return true;
        }
    }
    return false;
}

