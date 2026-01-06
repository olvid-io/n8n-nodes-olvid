/* eslint-disable n8n-nodes-base/node-class-description-inputs-wrong-regular-node */
// noinspection ExceptionCaughtLocallyJS

import {
	ApplicationError,
	IBinaryData,
	IDataObject,
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeBaseDescription,
	INodeTypeDescription,
	NodeParameterValueType,
	NodeConnectionTypes
} from 'n8n-workflow';


import { testOlvidCredentials } from '../../common-properties/testOlvidCredentials';
import {properties} from "./actions/properties";
import {OlvidClientSingleton} from "../../utils/OlvidClientSingleton";
import * as commands from "../../protobuf/olvid/daemon/command/v1/command";
import {convertN8nParametersToAValidRequestBuilder} from "../../Advanced/v1/convertN8nToProtobuf";
import {OlvidClient} from "../../client/OlvidClient";
import {buildResponseMessage} from "../../Advanced/v1/convertProtobufToN8n";
import * as datatypes from "../../protobuf/olvid/daemon/datatypes/v1/datatypes";
import {formatFileSize} from "../../utils/GenericFunctions";
import {getDurationInSeconds} from "../../common-properties/duration";
import {create} from "@bufbuild/protobuf";

import {contactSearch} from "../../common-properties/contactIdPicker";
import {discussionSearch} from "../../common-properties/discussionIdPicker";
import {executeSendAndWait} from "./actions/message/sendAndWait.operation";

export class OlvidV1 implements INodeType {
	description: INodeTypeDescription;

	constructor(baseDescription: INodeTypeBaseDescription) {
		this.description = {
			...baseDescription,
			displayName: 'Olvid',
			name: 'olvid',
			group: ['output'],
			version: 1,
			subtitle: '={{ $parameter["operation"] + ": " + $parameter["resource"] }}',
			description: 'Sends data to Olvid',
			defaults: {
				name: 'Olvid',
			},
			inputs: [NodeConnectionTypes.Main],
			outputs: [NodeConnectionTypes.Main],
			credentials: [
				{
					name: 'olvidApi',
					required: true,
					testedBy: 'testOlvidDaemon',
				},
			],
			properties: properties
		};
	}

	methods = {
		listSearch: {discussionSearch, contactSearch},
		credentialTest: { testOlvidDaemon: testOlvidCredentials },
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const operationResult: INodeExecutionData[] = [];

		// create client
		const credentials = await this.getCredentials('olvidApi') as { clientKey: string, daemonEndpoint: string };
		const client = OlvidClientSingleton.getInstance(credentials);

		// a node can receive one or more items as input, so we loop on this loop
		for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
			// retrieve command information
			const resourceName = this.getNodeParameter("resource", itemIndex);
			const operationName = this.getNodeParameter("operation", itemIndex);

			// prepare request: we convert n8n parameters to an object to use as protobuf request message
			const requestShape = this.getNode().parameters;
			convertN8nParametersToAValidRequestBuilder(requestShape, (parameterName) => { return this.getNodeParameter(parameterName, itemIndex) });

			try {
				let responseData: INodeExecutionData[] = [];
				// handle override methods (client streaming methods)
				if (resourceName === "message" && operationName === 'send') {
					responseData = await handleMessageSend(client, requestShape, this, itemIndex, (parameterName) => { return this.getNodeParameter(parameterName, itemIndex) });
				}
				else if (resourceName === "message" && operationName === 'sendAndWait') {
					responseData = await handleMessageSendAndWait(client, requestShape, this, itemIndex);
				}
				else if (resourceName === "attachment" && operationName === 'download') {
					responseData = await handleAttachmentDownload(client, requestShape, this);
				}
				// handle normal cases
				else {
					throw new ApplicationError(`Invalid resource and/or operation: ${resourceName} - ${operationName}`);
				}

				const executionDataWithMetadata = this.helpers.constructExecutionMetaData(responseData, {
					itemData: { item: itemIndex },
				});
				operationResult.push(...executionDataWithMetadata);
			}
			catch (err) {
				if (this.continueOnFail()) {
					operationResult.push({ json: this.getInputData(itemIndex)[0].json, error: err });
				} else {
					if (err.context) err.context.itemIndex = itemIndex;
					throw err;
				}
			}
		}

		return [operationResult];
	}
}

/*
** handle message send operation
*/
async function handleMessageSend(client: OlvidClient, requestShape: any, node: IExecuteFunctions, itemIndex: number, resolveParameterFunction: (parameterName: string) => NodeParameterValueType|object): Promise<INodeExecutionData[]> {
	const hasBody: boolean = requestShape['body'] !== undefined && requestShape['body'] !== null && (requestShape['body'] as string).trim().length > 0;
	const hasAttachments: boolean = requestShape['files'] !== undefined && requestShape['files'] !== null && (requestShape['files'] as IDataObject)['values'] !== undefined;
	if (!hasBody && !hasAttachments) {
		throw new ApplicationError('Please specify a message body or files to send');
	}

	let attachments: { filename: string; payload: Uint8Array }[] = [];
	if (hasAttachments) {
		for (const file of (requestShape['files'] as IDataObject)['values'] as IDataObject[]) {
			if (file['isBase64'] === true) {
				attachments.push({
					filename: file['fileName'] as string,
					payload: Buffer.from(file['fileData'] as string, 'base64'),
				});
			} else {
				const binaryPropertyName = file['binaryPropertyName'] as string;
				const binaryData = node.helpers.assertBinaryData(itemIndex, binaryPropertyName);
				const binaryDataBuffer = await node.helpers.getBinaryDataBuffer(
					itemIndex,
					binaryPropertyName,
				);
				attachments.push({
					filename: binaryData.fileName as string,
					payload: binaryDataBuffer,
				});
			}
		}
	}

	// convert discussion parameter (with a picker) to a valid discussionId
	requestShape["discussionId"] = requestShape["discussionPicker"]["value"];

	// parse fields in additional fields to request shape root
	const additionalFields = resolveParameterFunction('additionalFields') as IDataObject;
	requestShape["replyId"] = additionalFields["replyId"];
	requestShape["disableLinkPreview"] = additionalFields["disableLinkPreview"];
	requestShape["ephemerality"] = {};
	requestShape["ephemerality"]["readOnce"] = additionalFields["readOnce"];
	requestShape["ephemerality"]["existenceDuration"] = getDurationInSeconds(additionalFields, 'existenceDuration');
	requestShape["ephemerality"]["visibilityDuration"] = getDurationInSeconds(additionalFields, 'visibilityDuration');

	const response = await client.messageSendWithAttachments({...requestShape, attachments});
	return buildResponseMessage(response, commands.MessageSendWithAttachmentsResponseSchema, node.helpers.returnJsonArray);
}

async function handleMessageSendAndWait(client: OlvidClient, requestShape: any, node: IExecuteFunctions, itemIndex: number): Promise<INodeExecutionData[]> {
	return await executeSendAndWait(node, itemIndex, client);
}

async function handleAttachmentDownload(client: OlvidClient, requestShape: any, node: IExecuteFunctions): Promise<INodeExecutionData[]> {
	const returnData: INodeExecutionData[] = [];
	// list attachments for this message id
	for await (const attachment of client.attachmentList({ filter: create(datatypes.AttachmentFilterSchema, {messageId: requestShape["messageId"]}) })) {
		// download each attachment
		const chunks: Uint8Array[] = [];
		let totalLength = 0;
		for await (const chunk of client.attachmentDownload({attachmentId: attachment.id!})) {
			chunks.push(chunk);
			totalLength += chunk.length;
		}
		const binaryData: IBinaryData = {
			data: Buffer.concat(chunks, totalLength).toString('base64'),
			mimeType: attachment.mimeType,
			fileName: attachment.fileName,
			fileSize: formatFileSize(attachment.size),
			fileExtension: attachment.fileName.split('.').pop() || '',
		};

		// this is a hack: we re-use attachment get response to include attachment object in response
		const executionData = buildResponseMessage({attachment}, commands.AttachmentGetResponseSchema, node.helpers.returnJsonArray);
		executionData[0].binary = { data: binaryData };
		returnData.push(...executionData)
	}

	return returnData;
}
