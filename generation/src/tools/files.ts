import * as fs from "fs";

export function listFilesInDirectory(dir: string): string[] {
    try {
        return fs.readdirSync(dir);
    } catch (error) {
        console.error(`Error reading directory: ${error}`);
        return [];
    }
}

