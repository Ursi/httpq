const http = require('http'),
	https = require('https');

module.exports = {
	async get(...params) {
		return (await this.getRaw(...params)).toString();
	},
	async getRaw(...params) {
		if (params.length > 1) {
			params[1].method = 'GET';
		}

		return (await this.request(req => req.end(), ...params));
	},
	http: http,
	https: https,
	async post(...params) {
		return (await this.postRaw(...params)).toString();
	},
	async postRaw(message, options, encoding = 'utf8') {// encoding may have to be dealth with for sending raw data, not sure if it's ignored when sending a buffer
		options.method = 'POST';
		return (await this.request(req => req.end(message, encoding), options));
	},
	request(reqFunc, ...params) {
		return new Promise((resolve, reject) => {
			try {
				let protocol,
					first = params[0];
				if (typeof first == 'object') {
					protocol = first.protocol;
				} else {
					protocol = /^https/.test(first) ? https : http;
				}

				let req = protocol.request.apply(protocol, [...params, res => {
					let buffers = [];
					res.on('data', data => buffers.push(data));
					res.on('end', ()=> resolve(Buffer.concat(buffers)));
				}]);

				req.on('error', reject);
				reqFunc(req);
			} catch (error) {
				reject(error);
			}
		});
	},
};
