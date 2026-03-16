/* eslint-disable n8n-nodes-base/node-class-description-inputs-wrong-regular-node */
// noinspection ExceptionCaughtLocallyJS

import {
	ApplicationError,
	IBinaryData,
	IDataObject,
	IExecuteFunctions,
	INodeExecutionData,
	INodeParameters,
	INodeType,
	INodeTypeBaseDescription,
	INodeTypeDescription,
	NodeConnectionTypes,
	NodeOperationError,
} from 'n8n-workflow';

import { testOlvidCredentials } from '../../common-properties/testOlvidCredentials';
import { generatedProperties } from './generated/actions/generatedProperties';
import { OlvidClient } from '../../client/OlvidClient';
import * as datatypes from '../../protobuf/olvid/daemon/datatypes/v1/datatypes';
import * as commands from '../../protobuf/olvid/daemon/command/v1/command';
import { convertN8nParametersToAValidRequestBuilder } from './convertN8nToProtobuf';
import {
	buildListResponseMessage,
	buildResponseMessage,
} from './convertProtobufToN8n';
import { formatFileSize } from '../../utils/GenericFunctions';
import { create } from '@bufbuild/protobuf';
import { OlvidClientSingleton } from '../../utils/OlvidClientSingleton';

export class OlvidAdvancedV1 implements INodeType {
	description: INodeTypeDescription;

	constructor(baseDescription: INodeTypeBaseDescription) {
		this.description = {
			...baseDescription,
			// override base description attributes and add generated properties
			displayName: 'OlvidAdvanced',
			name: 'olvidAdvanced',
			group: ['output'],
			version: 1,
			subtitle:
				'={{ $parameter["operation"] + ": " + $parameter["resource"] }}',
			description: 'Interact with your Olvid Daemon',
			defaults: {
				name: 'OlvidAdvanced',
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
			// most of our node properties are generated, those properties contains:
			// actions list (ex: messageSend, invitationNew,...)
			// actions parameters
			properties: generatedProperties,
		};
	}

	methods = { credentialTest: { testOlvidDaemon: testOlvidCredentials } };

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const operationResult: INodeExecutionData[] = [];

		// create client
		const credentials = (await this.getCredentials('olvidApi')) as {
			clientKey: string;
			daemonEndpoint: string;
		};
		const client = OlvidClientSingleton.getInstance(credentials);

		// a node can receive one or more items as input, so we loop on this loop
		for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
			// retrieve command information
			const resourceName = this.getNodeParameter('resource', itemIndex);
			const operationName = this.getNodeParameter('operation', itemIndex);

			// determine the client method to use and force access to it
			const stubName: string = getStubName(resourceName);
			const stubMethodName: string = getStubMethodName(operationName);
			// @ts-ignore
			const stubFunction = client.stubs[stubName][stubMethodName];
			if (stubFunction === undefined) {
				throw new NodeOperationError(
					this.getNode(),
					`Invalid action resource / operation combination for stub function: ${resourceName} & ${operationName} (${stubName} / ${stubMethodName})`,
				);
			}

			// determine the response protobuf schema
			const schemaName: string = getResponseSchema(operationName);
			// @ts-ignore
			const responseSchema = commands[schemaName];
			if (responseSchema === undefined) {
				throw new NodeOperationError(
					this.getNode(),
					`Invalid action resource / operation combination for response schema: ${resourceName} & ${operationName} (${schemaName})`,
				);
			}

			// prepare request: we convert n8n parameters to an object to use as protobuf request message
			const requestShape = this.getNode().parameters;
			convertN8nParametersToAValidRequestBuilder(
				requestShape,
				(parameterName) => {
					return this.getNodeParameter(parameterName, itemIndex);
				},
			);

			try {
				let responseData: INodeExecutionData[] = [];

				// handle override methods (client streaming methods)
				if (operationName === 'MessageSendWithAttachments') {
					responseData = await handleMessageSendWithAttachments(
						client,
						requestShape,
						this,
						itemIndex,
					);
				} else if (operationName === 'AttachmentDownload') {
					responseData = await handleAttachmentDownload(
						client,
						requestShape,
						this,
					);
				} else if (operationName === 'GroupSetPhoto') {
					responseData = await handleGroupSetPhoto(
						client,
						requestShape,
						this,
						itemIndex,
					);
				} else if (operationName === 'IdentitySetPhoto') {
					responseData = await handleIdentitySetPhoto(
						client,
						requestShape,
						this,
						itemIndex,
					);
				}
				// handle normal cases
				else {
					const ret = await stubFunction(requestShape);
					// if ret is iterable it's a server streaming method, we concatenate response messages
					if (typeof ret[Symbol.asyncIterator] === 'function') {
						for await (const message of ret) {
							responseData.push(
								...buildListResponseMessage(
									message,
									responseSchema,
									this.helpers.returnJsonArray,
								),
							);
						}
					} else {
						responseData = buildResponseMessage(
							ret,
							responseSchema,
							this.helpers.returnJsonArray,
						);
					}
				}

				const executionDataWithMetadata =
					this.helpers.constructExecutionMetaData(responseData, {
						itemData: { item: itemIndex },
					});
				operationResult.push(...executionDataWithMetadata);
			} catch (err) {
				if (this.continueOnFail()) {
					operationResult.push({
						json: this.getInputData(itemIndex)[0].json,
						error: err,
					});
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
 ** Handlers for override entry point (clien streaming methods)
 */
async function handleMessageSendWithAttachments(
	client: OlvidClient,
	requestShape: any,
	node: IExecuteFunctions,
	itemIndex: number,
): Promise<INodeExecutionData[]> {
	const hasBody: boolean =
		requestShape['body'] !== undefined &&
		requestShape['body'] !== null &&
		(requestShape['body'] as string).trim().length > 0;
	const hasAttachments: boolean =
		requestShape['files'] !== undefined &&
		requestShape['files'] !== null &&
		(requestShape['files'] as IDataObject)['values'] !== undefined;
	if (!hasBody && !hasAttachments) {
		throw new ApplicationError(
			'Please specify a message body or files to send',
		);
	}
	let attachments: { filename: string; payload: Uint8Array }[] = [];
	if (hasAttachments) {
		for (const file of (requestShape['files'] as IDataObject)[
			'values'
		] as IDataObject[]) {
			if (file['isBase64'] === true) {
				attachments.push({
					filename: file['fileName'] as string,
					payload: Buffer.from(file['fileData'] as string, 'base64'),
				});
			} else {
				const binaryPropertyName = file['binaryPropertyName'] as string;
				const binaryData = node.helpers.assertBinaryData(
					itemIndex,
					binaryPropertyName,
				);
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
	const response = await client.messageSendWithAttachments({
		...requestShape,
		attachments,
	});
	return buildResponseMessage(
		response,
		commands.MessageSendWithAttachmentsResponseSchema,
		node.helpers.returnJsonArray,
	);
}

async function handleAttachmentDownload(
	client: OlvidClient,
	requestShape: any,
	node: IExecuteFunctions,
): Promise<INodeExecutionData[]> {
	const attachment: datatypes.Attachment =
		await client.attachmentGet(requestShape);
	const chunks: Uint8Array[] = [];
	let totalLength = 0;
	for await (const chunk of client.attachmentDownload(requestShape)) {
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
	const executionData = buildResponseMessage(
		{ attachment },
		commands.AttachmentGetResponseSchema,
		node.helpers.returnJsonArray,
	);
	executionData[0].binary = { data: binaryData };
	return executionData;
}

const CHUNK_SIZE = 1_000_000;

async function handleGroupSetPhoto(
	client: OlvidClient,
	requestShape: INodeParameters,
	node: IExecuteFunctions,
	itemIndex: number,
): Promise<INodeExecutionData[]> {
	const groupId: bigint = BigInt(
		node.getNodeParameter('groupId', itemIndex) as number,
	);
	const binaryPropertyName: string = node.getNodeParameter(
		'binaryPropertyName',
		itemIndex,
	) as string;
	const binaryData = node.helpers.assertBinaryData(
		itemIndex,
		binaryPropertyName,
	);
	const payload = await node.helpers.getBinaryDataBuffer(
		itemIndex,
		binaryPropertyName,
	);

	async function* requestStream(): AsyncIterable<commands.GroupSetPhotoRequest> {
		// send metadata
		yield create(commands.GroupSetPhotoRequestSchema, {
			request: {
				case: 'metadata',
				value: create(commands.GroupSetPhotoRequestMetadataSchema, {
					groupId: groupId,
					filename: binaryData.fileName,
					fileSize: BigInt(payload.length),
				}),
			},
		});

		// send payload
		let chunkNumber = Math.floor(payload.length / CHUNK_SIZE);
		chunkNumber += payload.length % CHUNK_SIZE !== 0 ? 1 : 0;
		let chunkIndex = 0;
		while (chunkIndex < chunkNumber) {
			let start = chunkIndex * CHUNK_SIZE;
			let end = (chunkIndex + 1) * CHUNK_SIZE;
			if (end > payload.length) {
				yield create(commands.GroupSetPhotoRequestSchema, {
					request: { case: 'payload', value: payload.subarray(start) },
				});
			} else {
				yield create(commands.GroupSetPhotoRequestSchema, {
					request: { case: 'payload', value: payload.subarray(start, end) },
				});
			}
			chunkIndex += 1;
		}
	}
	const response: commands.GroupSetPhotoResponse =
		await client.stubs.groupCommandStub.groupSetPhoto(requestStream());
	return buildResponseMessage(
		response,
		commands.GroupSetPhotoResponseSchema,
		node.helpers.returnJsonArray,
	);
}

async function handleIdentitySetPhoto(
	client: OlvidClient,
	requestShape: INodeParameters,
	node: IExecuteFunctions,
	itemIndex: number,
): Promise<INodeExecutionData[]> {
	const binaryPropertyName: string = node.getNodeParameter(
		'binaryPropertyName',
		itemIndex,
	) as string;
	const binaryData = node.helpers.assertBinaryData(
		itemIndex,
		binaryPropertyName,
	);
	const payload = await node.helpers.getBinaryDataBuffer(
		itemIndex,
		binaryPropertyName,
	);

	async function* requestStream(): AsyncIterable<commands.IdentitySetPhotoRequest> {
		// send metadata
		yield create(commands.IdentitySetPhotoRequestSchema, {
			request: {
				case: 'metadata',
				value: create(commands.IdentitySetPhotoRequestMetadataSchema, {
					filename: binaryData.fileName,
					fileSize: BigInt(payload.length),
				}),
			},
		});

		// send payload
		let chunkNumber = Math.floor(payload.length / CHUNK_SIZE);
		chunkNumber += payload.length % CHUNK_SIZE !== 0 ? 1 : 0;
		let chunkIndex = 0;
		while (chunkIndex < chunkNumber) {
			let start = chunkIndex * CHUNK_SIZE;
			let end = (chunkIndex + 1) * CHUNK_SIZE;
			if (end > payload.length) {
				yield create(commands.IdentitySetPhotoRequestSchema, {
					request: { case: 'payload', value: payload.subarray(start) },
				});
			} else {
				yield create(commands.IdentitySetPhotoRequestSchema, {
					request: { case: 'payload', value: payload.subarray(start, end) },
				});
			}
			chunkIndex += 1;
		}
	}
	const response: commands.IdentitySetPhotoResponse =
		await client.stubs.identityCommandStub.identitySetPhoto(requestStream());
	return buildResponseMessage(
		response,
		commands.IdentitySetPhotoResponseSchema,
		node.helpers.returnJsonArray,
	);
}

function getStubName(resourceName: string): string {
	const decapitalizedName =
		resourceName.charAt(0).toLowerCase() + resourceName.slice(1);
	return decapitalizedName.replace('Service', 'Stub');
}

function getStubMethodName(operationName: string): string {
	return operationName.charAt(0).toLowerCase() + operationName.slice(1);
}

function getResponseSchema(operationName: string): string {
	return `${operationName}ResponseSchema`;
}
