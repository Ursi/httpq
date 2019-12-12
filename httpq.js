const
	fs = require(`fs`),
	http = require(`http`),
	https = require(`https`);

function getProtocol(param) {
	if (typeof param === `object`) {
		if (param.protocol && param.protocol.match(/^https?:$/)) {
			return param.protocol.startsWith(`https`) ? https : http;
		} else {
			throw `Protocol must be either 'http:' or 'https:'`;
		}
	} else {
		return param.startsWith(`https`) ? https : http;
	}
}

module.exports = {
	async get(...args) {
		return (await this.getRaw(...args)).toString();
	},
	async getJson(...args) {
		return JSON.parse(await this.getRaw(...args));
	},
	async getRaw(...args) {
		return await this.imData(await this.getRes(...args));
	},
	async getRes(...args) {
		if (args.length > 1) {
			args[1].method = `GET`;
		}

		return res = await this.request(req => req.end(), ...args);
	},
	getToFile(filePath, ...args) {
		return new Promise(async resolve => {
			(await this.getRes(...args))
				.pipe(fs.createWriteStream(filePath))
				.on(`finish`, resolve);
		});
	},
	http: http,
	https: https,
	async post(...args) {
		return (await this.postRaw(...args)).toString();
	},
	async postJson(...args) {
		return JSON.parse(await this.postRaw(...args));
	},
	async postRaw(...args) {
		return await this.imData(await this.postRes(...args));
	},
	async postRes(message, options, encoding = `utf8`) { // encoding may have to be dealth with for sending raw data, not sure if it's ignored when sending a buffer
		options.method = `POST`;
		return res = await this.request(req => req.end(message, encoding), options);
	},
	request(reqFunc, ...args) {
		return new Promise((resolve, reject) => {
			try {
				let
					protocol = getProtocol(args[0]),
					req = protocol.request(...args, res => resolve(res));

				req.on(`error`, reject);
				reqFunc(req);
			} catch (error) {
				reject(error);
			}
		});
	},
	imData(im, write) {
		return new Promise(resolve => {
			let buffers = [];
			im.on(`data`, data => buffers.push(data));
			im.on(`end`, ()=> resolve(Buffer.concat(buffers)));
		});
	},
};
