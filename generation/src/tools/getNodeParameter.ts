export function getNodeParameter(parameterName: string, indented: boolean, itemName?: string): string {
    return indented ? `item${itemName}['${parameterName}']` : `this.getNodeParameter('${parameterName}', index)`;

}
