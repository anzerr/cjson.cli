
const fs = require('fs.promisify'),
	YAML = require('json.to.yaml'),
	vm = require('vm'),
	path = require('path');

class Runner {

	constructor(options) {
		this.options = options;
		this.filePath = path.join(options.cwd, options.file);
		this.outPath = path.join(options.cwd, options.out);
	}

	log(...arg) {
		if (this.options.verbose) {
			console.log(...arg);
		}
	}

	load(file) {
		const {ext} = path.parse(file);
		if (ext === '.json') {
			return fs.readFile(file).then((res) => {
				return JSON.parse(res.toString());
			});
		}
		if (ext === '.js') {
			return fs.readFile(file).then((res) => {
				const sandbox = {
					module: {},
					process: {env: process.env}
				};
				vm.createContext(sandbox);
				vm.runInContext(res.toString(), sandbox);
				return (sandbox.module.exports || {});
			});
		}
		throw new Error(`"${ext}" is not supported`);
	}

	get() {
		this.log(`format "${this.filePath}" to "${this.outPath}"`);
		return this.load(this.filePath).then((j) => {
			const json = {
				version: j.version,
				services: {},
				networks: j.networks,
				volumes: j.volumes
			};

			const key = (() => {
				let k = {}, o = [];
				for (let i in j.services) {
					for (let x in j.services[i]) {
						k[x] = true;
					}
				}
				for (let i in k) {
					o.push(i);
				}
				return o.sort();
			})();

			this.log('services found', key);

			for (const i in j.services) {
				const s = {};
				for (let x in key) {
					if (j.services[i][key[x]] !== undefined) {
						s[key[x]] = j.services[i][key[x]];
					}
				}
				json.services[i] = s;
			}

			if (this.options.dry) {
				return console.log(YAML.stringify(json));
			}

			return Promise.all([
				fs.writeFile(filePath, JSON.stringify(json, null, '\t')),
				fs.writeFile(outPath, YAML.stringify(json))
			]);
		}).then(() => {
			this.log('done');
		}).catch((e) => {
			console.log(this.options.verbose ? e : e.toString());
		});
	}

}

module.exports = (options) => {
	return (new Runner(options)).get();
};

