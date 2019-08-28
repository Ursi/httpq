const
	fs = require(`fs`),
	http = require(`http`),
	https = require(`https`);

function getProtocol(param) {
	if (typeof param == `object`) {
		return globalThis[param.protocol];
	} else {
		return /^https/.test(param) ? https : http;
	}
}

module.exports = {
	async get(...params) {
		return (await this.getRaw(...params)).toString();
	},
	async getRaw(...params) {
		return await this.resData(await this.getRes(...params));
	},
	async getRes(...params) {
		if (params.length > 1) {
			params[1].method = `GET`;
		}

		return res = await this.request(req => req.end(), ...params);
	},
	getToFile(filePath, ...params) {
		return new Promise(async resolve => {
			(await this.getRes(...params)).pipe(fs.createWriteStream(filePath))
				.on(`finish`, resolve);
		});
	},
	http: http,
	https: https,
	async post(...params) {
		return (await this.postRaw(...params)).toString();
	},
	async postRaw(...params) {
		return await this.resData(await this.postRes(...params));
	},
	async postRes(message, options, encoding = `utf8`) { // encoding may have to be dealth with for sending raw data, not sure if it's ignored when sending a buffer
		options.method = `POST`;
		return res = await this.request(req => req.end(message, encoding), options);
	},
	request(reqFunc, ...params) {
		return new Promise((resolve, reject) => {
			try {
				let
					protocol = getProtocol(params[0]),
					req = protocol.request(...params, res => resolve(res));

				req.on(`error`, reject);
				reqFunc(req);
			} catch (error) {
				reject(error);
			}
		});
	},
	resData(res, write) {
		return new Promise(resolve => {
			let buffers = [];
			res.on(`data`, data => buffers.push(data));
			res.on(`end`, ()=> resolve(Buffer.concat(buffers)));
		});
	},
};
