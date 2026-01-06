/* eslint-disable n8n-nodes-base/node-class-description-inputs-wrong-regular-node */
import {
	ApplicationError,
	INodeType,
	INodeTypeBaseDescription,
	INodeTypeDescription,
	ITriggerFunctions,
	ITriggerResponse,
	NodeConnectionTypes,
	NodeOperationError,
} from 'n8n-workflow';

import { testOlvidCredentials } from '../../common-properties/testOlvidCredentials';

import { generatedProperties } from './generated/triggers/generatedProperties';
import { ConnectError } from '@connectrpc/connect';
import { convertN8nParametersToAValidRequestBuilder } from './convertN8nToProtobuf';
import { buildResponseMessage } from './convertProtobufToN8n';
import { Message } from '@bufbuild/protobuf';
import * as notifications from "../../protobuf/olvid/daemon/notification/v1/notification";
import {buildDryRunMessage} from "./buildDryRunMessage";
import {OlvidClientSingleton} from "../../utils/OlvidClientSingleton";

/*
** Code entrypoint for our trigger node with it's json description and trigger method.
* Description is manually written in this file and import generated trigger descriptions.
* Trigger method will start an olvid notification listener converting passed parameters to a protobuf valid object
* then it emit an event on every received notification.z
 */
export class OlvidAdvancedTriggerV1 implements INodeType {
	description: INodeTypeDescription;

	constructor(baseDescription: INodeTypeBaseDescription) {
		this.description = {
			...baseDescription,
			// override base description attributes and add generated properties
			displayName: 'OlvidAdvanced Trigger',
			name: 'olvidAdvancedTrigger',
			group: ['trigger'],
			version: 1,
			description: 'Start the workflow on Olvid event',
			defaults: {
				name: 'OlvidAdvanced Trigger',
			},
			inputs: [],
			outputs: [NodeConnectionTypes.Main],
			credentials: [
				{
					name: 'olvidApi',
					required: true,
					testedBy: 'testOlvidDaemon',
				},
			],
			properties: [
				// most of our node properties are generated, those properties contains:
				// the list of triggers (ex: onMessageReceived, onMessageAdded,...) and their parameters
				...generatedProperties,
				// hardcoded properties common to every operation
				{
					displayName: "Enable dry-run to see an example of expected output data.",
					name: "notice",
					type: "notice",
					default: ""
				},
				{
					displayName: "Dry-run",
					name: "dry-run",
					type: "boolean",
					default: false,
					description: "Use mock data when testing this node to check it's output format",
				}
			],
		};
	}

	methods = { credentialTest: { testOlvidDaemon: testOlvidCredentials } };

	async trigger(this: ITriggerFunctions): Promise<ITriggerResponse> {
		const credentials = (await this.getCredentials('olvidApi')) as {
			clientKey: string;
			daemonEndpoint: string;
		};
		const client = OlvidClientSingleton.getInstance(credentials);

		// retrieve trigger information
		const triggerName: string = this.getNodeParameter('updates') as string;

		// determine the client method to use and force access to it
		const stubName: string = getStubName(triggerName);
		const stubMethodName: string = getStubMethodName(triggerName);
		// @ts-ignore
		const stubFunction = client.stubs[stubName][stubMethodName];
		if (stubFunction === undefined) {
			throw new NodeOperationError(this.getNode(), `Invalid trigger update type for stub method: ${triggerName} (${stubName} | ${stubMethodName})`);
		}

		// determine the response protobuf schema
		const notificationSchemaName: string = getResponseSchema(triggerName);
		// @ts-ignore
		const notificationSchema = notifications[notificationSchemaName];
		if (notificationSchema === undefined) {
			throw new NodeOperationError(this.getNode(), `Invalid trigger update type: ${triggerName}`);
		}

		// dry mode: build an example notification by filling all fields with data and return it (we do not want to use connection to daemon or parse parameters)
		if (this.getMode() === "manual" && this.getNodeParameter("dry-run") as boolean) {
			return {closeFunction: async () => {}, manualTriggerFunction: async () => {
					this.emit([buildDryRunMessage(notificationSchema, this.helpers.returnJsonArray)]);
				}};
		}

		// prepare request: we convert n8n parameters to an object to use as protobuf request message
		const requestShape = this.getNode().parameters;
		convertN8nParametersToAValidRequestBuilder(requestShape, (parameterName) => { return this.getNodeParameter(parameterName) });

		// called when a grpc notification message arrive
		const notificationCallback = (notificationMessage: Message) => {
			this.emit([buildResponseMessage(notificationMessage, notificationSchema, this.helpers.returnJsonArray)])
		}

		// called on grpc stub closure
		const stubCloseCallback = (error: ConnectError|undefined) => {
			if (error) {
				console.error(`${triggerName}: ConnectionError`, error);
				this.emitError(error);
			}
		}

		// in manual mode (when user manually execute workflow): add count parameter set to 1 to automatically end listener after first notif
		if (this.getMode() === "manual") {
			requestShape.count = 1;
		}

		// start listening for notifications
		let cancelFn = stubFunction(requestShape, notificationCallback, stubCloseCallback)

		// return close function
		return {
			closeFunction: async () => {
				cancelFn()
			}
		}
	}
}

function getStubName(triggerName: string): string {
	const splitOnCapitalLetters = triggerName.match(/[A-Z][a-z]+/g);
	if (!splitOnCapitalLetters) {
		throw new ApplicationError('Invalid trigger update type for stub method');
	}
	const datatypeName: string = splitOnCapitalLetters[0];
	const decapitalizedName = datatypeName.charAt(0).toLowerCase() + datatypeName.slice(1);
	return `${decapitalizedName}NotificationStub`;
}

function getStubMethodName(triggerName: string): string {
	return triggerName.charAt(0).toLowerCase() + triggerName.slice(1);
}

function getResponseSchema(triggerName: string): string {
	return `${triggerName}NotificationSchema`;
}
