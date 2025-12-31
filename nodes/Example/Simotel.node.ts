import type {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	IHttpRequestMethods
} from 'n8n-workflow';

export class Simotel implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Simotel',
		name: 'simotel',
		icon: 'file:simotel.svg',
		group: ['transform'],
		version: 1,
		description: 'Interact with Simotel API',
		defaults: { name: 'Simotel' },
		inputs: ['main'],
		outputs: ['main'],
		credentials: [{ name: 'simotelApi', required: true }],
		properties: [
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				options: [
					{ name: 'User', value: 'user' },
					{ name: 'Report', value: 'report' },
					{ name: 'Call Management', value: 'call' },
				],
				default: 'user',
				noDataExpression: true,
			},
			// OPERATIONS FOR USER
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				displayOptions: { show: { resource: ['report'] } },
				options: [
					{ name: 'Search Polls', value: 'search', description: 'Search call reports' },
				],
				default: 'search',
			},
			// FIELDS FOR USER ADD
			{
				displayName: 'User Name',
				name: 'userName',
				type: 'string',
				displayOptions: { show: { resource: ['user'], operation: ['add'] } },
				default: '',
				required: true,
			},
			{
				displayName: 'Number',
				name: 'number',
				type: 'string',
				displayOptions: { show: { resource: ['user'], operation: ['add'] } },
				default: '',
			}
			// ADD MORE FIELDS HERE BASED ON YOUR JSON
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];
		const credentials = await this.getCredentials('simotelApi');

		for (let i = 0; i < items.length; i++) {
			const resource = this.getNodeParameter('resource', i) as string;
			const operation = this.getNodeParameter('operation', i) as string;
			let requestOptions: any = {
				headers: { 'X-APIKEY': credentials.apiKey },
				auth: { user: credentials.apiUser, pass: credentials.apiPass },
				json: true,
			};
			if (resource === 'report' && operation === 'search') {
				requestOptions.method = 'POST';
				requestOptions.uri = `${credentials.serverAddress}/reports/poll/search`;
				requestOptions.body = {
					conditions: { from: "", to: "" }, // You can make these node parameters too!
					date_range: { from: "2023-01-01 00:00", to: "2023-12-31 23:59" },
					pagination: { start: 0, count: 20 },
				};
			}
			let responseData;

			if (resource === 'user' && operation === 'add') {
				const name = this.getNodeParameter('userName', i) as string;
				const number = this.getNodeParameter('number', i) as string;
				const options = {
					method: 'POST'as IHttpRequestMethods,
					uri: `${credentials.serverAddress}/pbx/users/add`,
					headers: {
						'X-APIKEY': credentials.apiKey as string,
					},
					auth: {
						user: credentials.apiUser as string,
						pass: credentials.apiPass as string,
					},
					body: {
						name,
						number: number,
						user_type: 'SIP', // Example from your JSON
						active: 'yes',
					},
					json: true,
				};
				responseData = await this.helpers.request(options);
			}
			returnData.push({ json: responseData });
		}
		return [this.helpers.returnJsonArray(returnData)];
	}
}