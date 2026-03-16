import { NodeParameterValueType } from 'n8n-workflow';

export function convertN8nParametersToAValidRequestBuilder(
	parameters: any,
	resolveParameterFunction: (
		parameterName: string,
	) => NodeParameterValueType | object,
) {
	resolveParametersValue(parameters, resolveParameterFunction);
	collectionsToList(parameters);
	convertOneOfFields(parameters);
}

function resolveParametersValue(
	obj: any,
	resolveParameterFunction: (
		parameterName: string,
	) => NodeParameterValueType | object,
) {
	for (const key in obj) {
		// for objects retrieve parameter item and recursively resolve values
		if (typeof obj[key] === 'object') {
			const parameters = resolveParameterFunction(key);
			recursivelyResolveAndFormatParameters(obj[key], parameters);
		}
		// directly resolve non object parameters
		else {
			obj[key] = resolveParameterFunction(key);
		}
	}
}

function recursivelyResolveAndFormatParameters(
	obj: any,
	parameters: object | NodeParameterValueType,
) {
	for (const key in obj) {
		// then resolve parameters
		if (typeof obj[key] === 'object') {
			if (obj[key] === undefined || obj[key] === null) {
				return;
			}
			// @ts-ignore
			recursivelyResolveAndFormatParameters(obj[key], parameters[key]);
		} else {
			// @ts-ignore
			obj[key] = parameters[key];
		}
	}
}

// this method recursively converts "collection" attributes to lists
// in parameters the lists are represented as a collection object and we must convert it to create a valid protobuf message
// ex: {"messageIds": {"collection": [{ "messageIds": { "type": 1, "id": 1 } }]}} => {"messageIds": [{"type": 1, "id": 1}]}
function collectionsToList(obj: any) {
	for (const key in obj) {
		// an object with a single collection attribute: this is what we are looking for
		if (
			obj[key] &&
			typeof obj[key] === 'object' &&
			Object.keys(obj[key]).length === 1 &&
			Object.keys(obj[key])[0] === 'collection' &&
			Array.isArray(obj[key]['collection'])
		) {
			const list = [];
			for (const element of obj[key]['collection']) {
				list.push(typeof element === 'object' ? element[key] : element);
			}
			obj[key] = list;
		}
		// recursive call for nested objects
		else if (obj[key] !== null && typeof obj[key] === 'object') {
			collectionsToList(obj[key]);
		}
	}
}

// this method recursively converts oneof parameters to valid protobuf values
// ex: "filter": { "replySelect": "replyToAMessage", "replyToAMessage": true } } => {"reply": {case: "replyToAMessage", "value": true}}
function convertOneOfFields(obj: any) {
	for (const key in obj) {
		// an object with a single collection attribute: this is what we are looking for
		if (typeof obj[key] === 'string' && key.endsWith('Select')) {
			const oneofName: string = key.replace('Select', '');
			const oneOfCase = obj[key];
			// set proper attribute
			obj[oneofName] = { case: oneOfCase, value: obj[oneOfCase] };
			// remove previous selector
			delete obj[key];
			delete obj[oneOfCase];
		}
		// recursive call for nested objects
		else if (obj[key] !== null && typeof obj[key] === 'object') {
			convertOneOfFields(obj[key]);
		}
	}
}
