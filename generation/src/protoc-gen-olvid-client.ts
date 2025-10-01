import {createEcmaScriptPlugin, runNodeJs, type Schema} from "@bufbuild/protoplugin";
import { getFieldAsAParameter, getFieldTsType, getMessageTsType } from "./client/gentools";
import {olvidClientTemplate, olvidAdminClientTemplate} from "./client/olvid_client_templates";
import type { DescMethod, DescService, DescField } from "@bufbuild/protobuf";

function dumpCommandMethod(service: DescService, method: DescMethod): string {
    // is list method (specific case)
    let isListMethod: boolean = method.methodKind === "server_streaming" && method.output.fields.length === 1 && method.output.fields[0].fieldKind === "list";
    // list methods are synchronous
    let isAsync: boolean = !isListMethod;
    // stub info
    const serviceStubName: string = `${service.name[0].toLowerCase()}${service.name.slice(1).replace("Service", "Stub")}`
    const stubHolder: string = service.name.endsWith("AdminService") ? "adminStubs" : "stubs";

    // method name
    const methodName = service.name.endsWith("AdminService") ? `admin${method.name}` : method.name[0].toLowerCase() + method.name.slice(1);

    // method parameters
    let methodParameters = `request: {${method.input.fields.map((f: DescField) => getFieldAsAParameter(f)).join(", ")}}`;

    // if method only have optional fields mark request object as optional
    if (method.input.fields.length == 0 || method.input.fields.filter((f: DescField) => !f.proto.proto3Optional).length === 0) {
        methodParameters += " = {}";
    }

    // method return type and body
    let methodReturnType = "";
    let methodBody = "";

    // client side streaming methods
    if (method.methodKind === "client_streaming" || method.methodKind === "bidi_streaming") {
        return `\t// ${method.name}: cannot generate code for client and bidirectional streaming`;
    }
    // keycloak user list specific case
    else if (method.name === "KeycloakUserList") {
        // you can ignore next warning and next error
        return `    keycloakUserList(request: {filter?: datatypes.KeycloakUserFilter, lastListTimestamp?: bigint} = {}): AsyncIterable<command.KeycloakUserListResponse> {
        async function *list(keycloakCommandStub: Client<typeof services.KeycloakCommandService>): AsyncIterable<command.KeycloakUserListResponse> {
            for await (const response of keycloakCommandStub.keycloakUserList(request)) {
                yield response
            }
        }
        return list(this.stubs.keycloakCommandStub)
    }`;
    }
    // list method specific case
    else if (isListMethod) {
        methodReturnType = `AsyncIterable<${getFieldTsType(method.output.fields[0]).replace("[]", "")}>`;
        methodBody = `async function *list(${serviceStubName}: Client<typeof services.${service.name}>): ${methodReturnType} {
            for await (const response of ${serviceStubName}.${method.localName}(request)) {
                for (const element of response.${method.output.fields[0].localName}) {
                    yield element;
                }
            }
        }
        return list(this.${stubHolder}.${serviceStubName});`
    }
    // other server streaming methods
    else if (method.methodKind === "server_streaming") {
        let yield_instruction: string = "";
        isAsync = false;
        if (method.output.fields.length == 0) {
            methodReturnType = "void";
        }
        else if (method.output.fields.length == 1) {
            methodReturnType = `AsyncIterable<${getFieldTsType(method.output.fields[0])}>`;
            yield_instruction = `yield response.${method.output.fields[0].localName}`
        }
        else {
            methodReturnType = `AsyncIterable<[${method.output.fields.map((f: DescField) => getFieldTsType(f)).join(", ")}}]>`;
            yield_instruction = `yield (${method.output.fields.map((f: DescField) => `response.${f.localName}!`).join(", ")})`
        }
        methodBody = `async function *list(${serviceStubName}: Client<typeof services.${service.name}>): ${methodReturnType} {
            for await (const response of ${serviceStubName}.${methodName}(request)) {
                ${yield_instruction};
            }
        }
        return list(this.${stubHolder}.${serviceStubName});`
    }
    // unary methods
    else if (method.methodKind === "unary") {
        if (method.output.fields.length == 0) {
            methodReturnType = "void";
            methodBody = `await this.${stubHolder}.${serviceStubName}.${method.localName}(request)`;
        }
        else if (method.output.fields.length == 1) {
            methodReturnType = `${method.output.fields.map((f: DescField) => getFieldTsType(f)).join(", ")}`
            methodBody = `let response: ${getMessageTsType(method.output, true)} = await this.${stubHolder}.${serviceStubName}.${method.localName}(request)
        return response.${method.output.fields[0].localName}!`
        }
        else {
            methodReturnType = `(${method.output.fields.map((f: DescField) => getFieldTsType(f)).join(", ")})`
            methodBody = `let response: ${getMessageTsType(method.output, true)} = await this.${stubHolder}.${serviceStubName}.${method.localName}(request)
        return response[${method.output.fields.map((f: DescField) => `response.${f.localName}!`).join(", ")}]`
        }
    }

    return `   ${isAsync ? "async " : ""}${methodName}(${methodParameters}): ${isAsync ? `Promise<${methodReturnType}>` : methodReturnType} {
        ${methodBody}
    }`
}

function dumpNotificationMethod(service: DescService, method: DescMethod): string {
    // stub info
    const serviceStubName: string = `${service.name[0].toLowerCase()}${service.name.slice(1).replace("Service", "")}Stub`

    // method name
    const methodName: string = `on${method.name}`;

    // callback and endCallback parameters
    const callbackParameters: string = method.output.fields.map((f: DescField) => getFieldAsAParameter(f)).join(", ");
    const endCallbackParameters: string = method.input.fields.map((f: DescField) => getFieldAsAParameter(f)).join(", ");

    // method parameters
    const methodParameters: string = `args: {callback: (${callbackParameters}) => Promise<void> | void, endCallback?: (error ?: Error) => void, ${endCallbackParameters}}`;

    // stub parameters
    const stubParameters: string = method.input.fields.map((f: DescField) => `${f.localName}: args.${f.localName}`).join(", ");

    return `    public ${methodName}(${methodParameters}): Function {
        let cancelFn: Function;
        const callbackId = crypto.randomUUID();
        this.activeCallbacks.add(callbackId);

        let wrappedCallback = (notification: ${getMessageTsType(method.output, true)}) => {
            Promise.resolve()
                .then(() => args.callback.call(this, ${method.output.fields.map((f: DescField) => `notification.${f.localName}!`).join(", ")}))
                .catch(e => {
                    console.error("${methodName}", e);
                });
        };

        let wrappedEndCallback = (error ?: Error) => {
            if (error) {
                console.error("${methodName}: unexpected error", error);
            }
            args.endCallback ? args.endCallback(error) : undefined;
            this.activeCallbacks.delete(callbackId);
            this.callbackUpdate.emit("removed");
        }

        cancelFn = this.stubs.${serviceStubName}.${method.localName}({${stubParameters}}, wrappedCallback, wrappedEndCallback, {signal: this.callbacksAbort.signal});
        return cancelFn;
    }`
}

export function generateOlvidClient(schema: Schema) {
    // generateAction fron service nodes only
    if (schema.files.filter(f => f.name.includes("/services/")).length === 0) {
        return;
    }

    let commandServiceFile = schema.files.filter(f => f.name.includes("/services/v1/command")).pop();
    let notificationServiceFile = schema.files.filter(f => f.name.includes("/services/v1/notification")).pop();
    let clientFile = schema.generateFile("OlvidClient.ts");

    /*
    ** command and notification methods
     */
    let clientMethods  = ""
    commandServiceFile?.services.forEach(service => {
        clientMethods += `    /*\n    ** ${service.name}\n    */\n`
        service.methods.forEach(method => {
            clientMethods += dumpCommandMethod(service, method) + "\n\n";
        })
    })
    notificationServiceFile?.services.forEach(service => {
        clientMethods += `    /*\n    ** ${service.name}\n    */\n`;
        service.methods.forEach(method => {
            clientMethods += dumpNotificationMethod(service, method) + "\n\n";
        })
    })

    /*
    ** stub declaration and creation
    */
    let stubDeclaration = "";
    let stubCreation = "";
    commandServiceFile?.services.forEach(service => {
        const stubName = `${service.name[0].toLowerCase()}${service.name.slice(1).replace("Service", "Stub")}`;
        stubDeclaration += `        ${stubName}: Client<typeof services.${service.name}>;\n`;
        stubCreation += `            ${stubName}: createClient(services.${service.name}, this.transport),\n`;
    })
    notificationServiceFile?.services.forEach(service => {
        const stubName = `${service.name[0].toLowerCase()}${service.name.slice(1).replace("Service", "Stub")}`;
        stubDeclaration += `        ${stubName}: CallbackClient<typeof services.${service.name}>;\n`;
        stubCreation += `            ${stubName}: createCallbackClient(services.${service.name}, this.transport),\n`;
    })

    let templateMap: {pattern: string, value: string}[] = [
        {pattern: "//@CLIENT_STUB_DECLARATION@", value: stubDeclaration},
        {pattern: "//@CLIENT_STUB_CREATION@", value: stubCreation},
        {pattern: "//@CLIENT_METHODS@", value: clientMethods}
    ];

    let template: string = olvidClientTemplate;
    for (let el of templateMap) {
        template = template.replace(el.pattern, el.value);
    }
    clientFile.print(template)
}

export function generateOlvidAdminClient(schema: Schema) {
    // generateAction fron service nodes only
    if (schema.files.filter(f => f.name.includes("/services/")).length === 0) {
        return;
    }

    let adminServiceFile = schema.files.filter(f => f.name.includes("/services/v1/admin")).pop();
    let clientFile = schema.generateFile("OlvidAdminClient.ts");

    let adminClientMethods  = ""

    /*
     ** admin methods
     * */
    adminServiceFile?.services.forEach(service => {
        adminClientMethods += `    /*\n    ** ${service.name}\n    */\n`
        service.methods.forEach(method => {
            adminClientMethods += dumpCommandMethod(service, method) + "\n\n";
        })
    })

    /*
    ** stub declaration and creation
     */
    let stubDeclaration = "";
    let stubCreation = "";
    adminServiceFile?.services.forEach(service => {
        const stubName = `${service.name[0].toLowerCase()}${service.name.slice(1).replace("Service", "Stub")}`;
        stubDeclaration += `        ${stubName}: Client<typeof services.${service.name}>;\n`;
        stubCreation += `            ${stubName}: createClient(services.${service.name}, this.transport),\n`;
    })

    let template: string = olvidAdminClientTemplate;
    let templateMap: {pattern: string, value: string}[] = [
        {pattern: "//@ADMIN_CLIENT_STUB_DECLARATION@", value: stubDeclaration},
        {pattern: "//@ADMIN_CLIENT_STUB_CREATION@", value: stubCreation},
        {pattern: "//@ADMIN_CLIENT_METHODS@", value: adminClientMethods}
    ];

    for (let el of templateMap) {
        template = template.replace(el.pattern, el.value);
    }
    clientFile.print(template)
}

const plugin = createEcmaScriptPlugin({
    name: "protoc-gen-olvid-client",
    version: process.env.npm_package_version ?? "1.0.0",

    // parseOptions: (rawOptions) => {
    //     const defaultOptions = {
    //         "decorators": true
    //     }
    //     for (let option of rawOptions) {
    //         if (option["key"] == "decorators") {
    //             if (option["value"] == "ignore") {
    //                 defaultOptions["decorators"] = false;
    //             }
    //         }
    //     }
    //     return defaultOptions;
    // },
    generateTs: function (schema: Schema): void {
        generateOlvidClient(schema);
        generateOlvidAdminClient(schema);
    }
});

runNodeJs(plugin);
