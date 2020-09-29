#!/usr/bin/env node

require('dotenv').config();

const {Cli, Map} = require('cli.util'),
	run = require('./src/run');

(() => {
	let cli = new Cli(process.argv, [
		new Map('cwd')
			.alias(['c', 'C'])
			.argument(),
		new Map('file')
			.alias(['f', 'F'])
			.argument(),
		new Map('out')
			.alias(['o', 'O'])
			.argument(),
		new Map('dry')
			.alias(['d', 'D']),
		new Map('format'),
		new Map('verbose')
			.alias(['v', 'V'])
	]);

	run({
		cwd: cli.get('cwd') || './',
		file: cli.get('file') || 'docker-compose.json',
		out: cli.get('out') || 'docker-compose.yml',
		dry: cli.has('dry'),
		format: cli.has('format'),
		verbose: cli.has('verbose')
	});
})();
