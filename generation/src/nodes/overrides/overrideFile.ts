import type { Schema } from "node_modules/@bufbuild/protoplugin/dist/cjs";
import { readFileSync, existsSync } from 'fs';
import * as path from 'path';
import { getTriggerFileName, getActionFileName, getActionFilePath, getTriggerFilePath } from '../tools/tools';
import type { DescMethod } from "@bufbuild/protobuf"

export function overrideActionFile(schema: Schema, method: DescMethod): boolean {
	const filename = getActionFileName(method);
	const originalFilePath = path.join(__dirname, "../overrides", filename);
	// destination path must be relative
	const destinationFilePath = path.join("actions", getActionFilePath(method));

	// check there is an override file
	if (existsSync(originalFilePath)) {
		const destinationFile = schema.generateFile(destinationFilePath);
		destinationFile.print(`// Copied from: ${path.join('../overrides', filename)}`);
		destinationFile.print(readFileSync(originalFilePath, 'utf8'));
		return true;
	}
	return false;
}

export function overrideTriggerFile(schema: Schema, method: DescMethod): boolean {
		const filename = getTriggerFileName(method);
		const originalFilePath = path.join(__dirname, "../overrides", filename);
		// destination path must be relative
		const destinationFilePath = path.join("triggers", getTriggerFilePath(method));

		// check there is an override file
		if (existsSync(originalFilePath)) {
			const destinationFile = schema.generateFile(destinationFilePath);
			destinationFile.print(`// Copied from: ${path.join('../overrides', filename)}`);
			destinationFile.print(readFileSync(originalFilePath, 'utf8'));
			return true;
		}
    return false;
}
