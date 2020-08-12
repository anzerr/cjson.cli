
const fs = require('fs.promisify'),
    YAML = require('json.to.yaml'),
    path = require('path');

module.exports = (options) => {
    const filePath = path.join(options.cwd, options.file),
        outPath = path.join(options.cwd, options.out);
    if (options.verbose) {
        console.log(`format "${filePath}" to "${outPath}"`);
    }
    return fs.readFile(filePath).then((res) => {
        let j = JSON.parse(res.toString()), json = {
            version: j.version,
            services: {},
            networks: j.networks
        };
    
        let key = (() => {
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
    
        for (let i in j.services) {
            let s = {};
            for (let x in key) {
                if (j.services[i][key[x]] !== undefined) {
                    s[key[x]] = j.services[i][key[x]];
                }
            }
            json.services[i] = s;
        }
    
        if (options.dry) {
            return console.log(YAML.stringify(json));
        }

        return Promise.all([
            fs.writeFile(filePath, JSON.stringify(json, null, '\t')),
            fs.writeFile(outPath, YAML.stringify(json))
        ]);
    }).then(() => {
        if (options.verbose) {
            console.log('done');
        }
    }).catch((e) => {
        console.log(options.verbose ? e : e.toString());
    });
};

