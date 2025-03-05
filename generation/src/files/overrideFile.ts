import type { Schema } from "node_modules/@bufbuild/protoplugin/dist/cjs";
import { readFileSync } from 'fs';
import * as path from 'path';
import { decapitalize } from "src/tools/tools";

export function overrideFile(schema: Schema, fileList: string[], serviceName: string, methodName: string, directoryName: string): boolean {
    const actionFileName = `${decapitalize(methodName)}.operation.ts`;
    const triggerFileName = `on${methodName}.event.ts`;
    const fileNames = [actionFileName, triggerFileName];

    for (const fileName of fileNames) {
        const sourceFilePath = path.join(__dirname, "../overrides", fileName);
        const destinationFilePath = path.join(directoryName, serviceName, fileName);
        if (fileList.includes(fileName)) {
            const destinationFile = schema.generateFile(destinationFilePath);
            destinationFile.print(`// Copied from: ${path.join('overrides', fileName)}`);
            destinationFile.print(readFileSync(sourceFilePath, 'utf8'));
            return true;
        }
    }
    return false;
}

