[Install for development](#install)  
[Add basic action](#Add a New Action to OlvidBasic)  
[Add basic trigger](#Add a New Trigger to OlvidTrigger)  

# Install
1. Clone the repository:
	 ```
	 git clone --recurse-submodules https://github.com/olvid-io/n8n-nodes-olvid
	 ```
2. Change to the directory:
	 ```
	 cd n8n-nodes-olvid
	 ```
3. Install the dependencies:
	 ```
	 pnpm install
	 ```
4. Add n8n to pnpm
	 ```
	 pnpm install n8n -g && n8n
	 ```
	 Exit n8n with `Ctrl+C` when you see `Editor is now accessible via: http://localhost:5678/`
5. Add your node to pnpm locally:
	 ```
	 npm run generate && pnpm run build && pnpm link --global
	 ```
6. Link your node with n8n (you only have to do it once):
	 ```
	 mkdir -p ~/.n8n/custom && cd ~/.n8n/custom && pnpm init; pnpm link --global n8n-nodes-olvid && cd - && chmod 600 ~/.n8n/config
	 ```
7. Start n8n:
	 ```
	 n8n
	 ```
	Note: You could also run with `nodemon` to react at file change with `npm run dev`
8. Open your browser to `http://localhost:5678`.


```
pnpm run dev
```

# Add a New Action to OlvidBasic

This section will walk you through the process of adding a new action to our custom n8n node OlvidBasic. By the end of this tutorial, you'll have a solid understanding of how to extend the functionality of n8n nodes and contribute to the OlvidBasic node.

## Prerequisites

Before you begin, ensure you have the following:

- **Development Environment**: Familiarity with JavaScript or TypeScript and a suitable code editor.
- **n8n Setup**: A local instance of n8n running for testing purposes.
- **Node Package Manager**: [pnpm](https://pnpm.io/) is recommended for managing dependencies.

## Steps to Add a New Action

1. **Set Up the Development Environment**:

	- Follow the steps in the [Quick Start](QUICKSTART.md) guide to clone the repository and install dependencies.

2. **Understand the Node Structure**:

	- Our node is located in the `nodes/Olvid/Basic` directory. Since we're using v1 and wanting to add an action, let's go into the `nodes/Olvid/Basic/v1/actions` directory. Here you'll find:
		- Folders for each service (resource in n8n terminology).
		- `versionDescription.ts` file that contains the node's metadata.
		- `router.ts` file that handles the execution of actions.

3. **Create the Action's Metadata**:

	- Open or create the folder for the service you want to use. Here, we will choose the `message` folder. (nodes/Olvid/Basic/v1/actions/message)
	- Create a new file for the action. For example, `get.operation.ts`. (operation is the n8n terminology for a rpc)
	- Define the action's metadata in the file:

		```typescript
		import {
			type IExecuteFunctions,
			type INodeProperties,
			type INodeExecutionData,
			updateDisplayOptions,
		} from 'n8n-workflow';
		import { datatypes, OlvidClient } from '@olvid/bot-node';
		import { getMessageId, messageId, messageIdType } from '../properties/messageId';

		const properties: INodeProperties[] = [
			{ ...messageId, required: true },
			{ ...messageIdType, required: true },
		];

		const displayOptions = {
			show: {
				resource: ['message'],
				operation: ['get'],
			},
		};

		export const description = updateDisplayOptions(displayOptions, properties);
		```

4. **Implement the Action's Logic**:

	- In the same file, add the logic to execute the action:

		```typescript
		export async function execute(
			this: IExecuteFunctions,
			index: number,
			client: OlvidClient,
		): Promise<INodeExecutionData[]> {
			const messageId: datatypes.MessageId = getMessageId.call(this, index)!;

			const message = await client.messageGet({ messageId });
			return this.helpers.returnJsonArray({ message: message });
		}
		```

5. **Expose the New Action to n8n**:

	- In the same folder, open `index.ts` (or create it), import your action, export it for the router

		```typescript
		import * as get from './get.operation';
		export { get };
		```

		 <details><summary>If there was no index.ts</summary>

		Here's the base for index.ts

		```typescript
		import type { INodeProperties } from 'n8n-workflow';

		import * as get from './get.operation';
		export { get };

		export const descriptions: INodeProperties[] = [
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['message'], // Change the resource
					},
				},
				options: [
					// Add your operations
					{
						name: 'Get',
						value: 'get',
						description: 'Get a message',
						action: 'Get a message',
					},
				],
				default: 'get', // Don't forget the default value
			},
			// Add your operations descriptions
			...get.description,
		];
		```

		 </details>

	- Add it to the list of available actions in options

		```typescript
		options: [
			{
				name: 'Get',
				value: 'get',
				description: 'Get a message',
				action: 'Get a message',
			},
		];
		```

		Don't forget to import the action description below (outside of the options array)

		```typescript
		...get.description,
		```

	- Add the resource (service) in versionDescription.ts (if it is not already there)

		```typescript
		options: [
		 {
				name: 'Message',
				value: 'message',
		 },
		],
		...message_operations.descriptions,
		```

	- Add the action to the router

		First, in the OlvidMap, add your action

		```typescript
		type OlvidMap = AllEntities<{
			message: 'get';
		}>;
		```

		Note: if there are multiple actions, you can add them as a union type, like `'get' | 'list' | 'send'`.

		Then, if your service has not been defined, find the `switch (olvidMap.resource)` and add your service

		```typescript
		switch (olvidMap.resource) {
			case 'message':
				responseData = await message_operations[olvidMap.operation].execute.call(this, i, client);
				break;
		}
		```

6. **Test the New Action**:

	- Start your n8n instance with `npm run dev` and test the new action in the workflow editor.

Happy coding!


# Add a New Trigger to OlvidTrigger

This section will walk you through the process of adding a new trigger event to our custom n8n node OlvidTrigger. By the end of this tutorial, you'll understand how to extend the functionality of n8n trigger nodes and contribute to the OlvidTrigger node.

## Prerequisites

Before you begin, ensure you have the following:

- **Development Environment**: Familiarity with JavaScript or TypeScript and a suitable code editor.
- **n8n Setup**: A local instance of n8n running for testing purposes.
- **Node Package Manager**: [pnpm](https://pnpm.io/) is recommended for managing dependencies.

## Steps to Add a New Trigger

1. **Set Up the Development Environment**:

   - Follow the steps in the [Quick Start](QUICKSTART.md) guide to clone the repository and install dependencies.

2. **Understand the Node Structure**:

   - Our node is located in the `nodes/Olvid/Basic` directory. Since we're using v1 and wanting to add an action, let's go into the `nodes/Olvid/Basic/v1/triggers` directory. Here you'll find:
     - Folders for each service (resource in n8n terminology).
     - `versionDescription.ts` file that contains the node's metadata.
     - `router.ts` file that handles the execution of actions.

3. **Create the Trigger's file**:

   - Open or create the folder for the service you want to use. Here, we will create the `discussion` folder (nodes/Olvid/Basic/v1/triggers/discussion).
   - Create a new file for the trigger. For example, `onDiscussionNew.event.ts`.
   - Add the logic to execute the trigger:

     ```typescript
     import { datatypes, OlvidClient } from "@olvid/bot-node";
     import { ITriggerFunctions } from "n8n-workflow";

     export function discussionNew(
     	this: ITriggerFunctions, client: OlvidClient, onCallback?: Function, returnMockData: Boolean = false
     ): Function {
     	return client.onDiscussionNew({
             callback: (discussion: datatypes.Discussion) => {
                 this.emit([this.helpers.returnJsonArray({ "discussion": discussion })]);
                 onCallback?.();
             },
             endCallback: () => { }
         });
     }
     ```

4. **Expose the New Trigger to n8n**:

   - In the same folder, open `index.ts` (or create it), import your trigger, export it for the router

   ```typescript
   import { discussionNew } from './onDiscussionNew.event'
   export { discussionNew };
   ```

   - Add the trigger in `versionDescription.ts` (in the triggers folder)

   ```typescript
   options: [
     {
       name: 'Discussion new',
       value: 'discussionNew',
       description: 'Triggers when a new discussion is created',
     },
   ],
   ```

   - Add the trigger in `router.ts` (in the triggers folder)

   First, import the service if is isn't already imported

   ```typescript
   import * as discussion from './discussion';
   ```

   Then, seach the `initializeListener` function and add your case in `switch (listener)`

   ```typescript
   switch (listener) {
   	case 'discussionNew':
         return discussion.discussionNew.call(this, client, callback, returnMockData);
   }
   ```

5. **Test the New Trigger**:

   - Start your n8n instance with `npm run dev` and test the new action in the workflow editor.

Happy coding!
