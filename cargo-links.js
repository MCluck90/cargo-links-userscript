// ==UserScript==
// @name        Cargo Links
// @description Make crates in Cargo.toml dependencies in to links.
// @author      Mike Cluck
// @namespace   mcluck
// @grant       none
// @version     1.0
// @include     http://github.com/*/Cargo.toml
// @include     https://github.com/*/Cargo.toml
// ==/UserScript==

(function () {
	'use strict';

	const cargoToml = document.querySelector('.type-toml');
	if (cargoToml === null) {
		console.warn('Unable to find TOML contents');
		return;
	}
	const lines = Array.from(cargoToml.querySelectorAll('.js-file-line'));
	const dependenciesLineIndex = lines.findIndex((line) => line.innerText === '[dependencies]');
	if (dependenciesLineIndex === -1) {
		console.warn('Unable to find dependencies');
	}

	const dependencies = lines.slice(dependenciesLineIndex + 1);
	for (let dependency of dependencies) {
		const crateName = dependency.querySelector('.pl-smi').innerText;
		let version = dependency.querySelector('.pl-s').innerText.replace(/"/g, '');
		// Append a zero for any crates which do not specify patch level
		// TODO: Get the latest patch version
		if ((version.match(/\./g) || []).length === 1) {
			version += '.0';
		}
		const url = `https://crates.io/crates/${crateName}/${version}`;
		const link = document.createElement('a');
		link.innerHTML = dependency.innerHTML;
		link.href = url;
		dependency.innerHTML = '';
		dependency.appendChild(link);
	}
})();