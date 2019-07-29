const http = require('http'),
	https = require('https');

module.exports = {
	get(...params) {
		if (params.length > 1) {
			params[1].method = 'GET';
		}

		return this.request(req => req.end(), ...params)
	},
	post(message, options, encoding = 'utf8') {
		options.method = 'POST';
		return this.request(req => req.end(message, encoding), options);
	},
	request(reqFunc, ...params) {
		return new Promise((resolve, reject) => {
			try {
				let req = https.request.apply(https, [...params, res => {
					res.setEncoding('utf8');
					let body = '';
					res.on('data', chunk => body += chunk);
					res.on('end', ()=> resolve(body));
				}]);

				reqFunc(req);
			} catch (error) {
				reject(error);
			}
		});
	},
};


		/*let scheme;
		if (/^https/.test(downloadLink)) {
			scheme = https;
		} else {
			scheme = http
		}

		scheme.get(downloadLink, res => {
			let buffArr = [];
			res.on('data', data => buffArr.push(data));
			res.on('end', ()=> resolve(fs.writeFileSync(path.join(videoPath, name + '.mp4'), Buffer.concat(buffArr))));
		});

*/
