import {createEcmaScriptPlugin, runNodeJs, type Schema} from "@bufbuild/protoplugin";

/*
** barrels are simply files that import other files content to create "submodules"
* for example we create a datatypes.ts file that will import everything next to it
* and allows us to import datatypes module in olvid.ts root file
 */
export default function generateBarrels(schema: Schema) {
    const moduleName = schema.files[0].name.split("/").slice(-3, -2)[0];
    const barrelFilePath = schema.files[0].name.split("/").slice(0, -1).join("/") + "/" + moduleName + ".ts";
    const barrelFile = schema.generateFile(barrelFilePath);

    for (const file of schema.files) {
        if (file.services.length > 0) {
            barrelFile.print(`export * from "./${file.name.split("/").slice(-1)}_connect";`);
        }
        if (file.messages.length > 0) {
            barrelFile.print(`export * from "./${file.name.split("/").slice(-1)}_pb";`);
        }
    }

    console.error(`${moduleName}: Barrels are in the hold🏴‍☠️`)
}

const plugin = createEcmaScriptPlugin({
    name: "protoc-gen-barrels",
    version: process.env.npm_package_version ?? "1.0.0",

    generateTs: function (schema: Schema): void {
        generateBarrels(schema);
    }
});

runNodeJs(plugin);
