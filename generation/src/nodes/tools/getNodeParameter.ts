export function getActionNodeParameter(parameterName: string, indented: boolean, itemName?: string): string {
    return indented ? `item${itemName}['${parameterName}']` : `this.getNodeParameter('${parameterName}', index)`;
}

export function getTriggerNodeParameter(parameterName: string, indented: boolean, itemName?: string): string {
	return indented ? `item${itemName}['${parameterName}']` : `this.getNodeParameter('${parameterName}')`;
}
