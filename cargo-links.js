// ==UserScript==
// @name        Cargo Links
// @description Make crates in Cargo.toml dependencies in to links.
// @author      Mike Cluck
// @namespace   mcluck
// @downloadURL https://raw.githubusercontent.com/MCluck90/cargo-links-userscript/master/cargo-links.js
// @grant       none
// @version     1.1
// @include     http://github.com/*
// @include     https://github.com/*
// ==/UserScript==

(function () {
	'use strict';

	let currentURL = window.location.href;
	function checkForUrlChange() {
		let newURL = window.location.href;
		if (newURL !== currentURL) {
			requestAnimationFrame(createLinks);
		}
		currentURL = newURL;
		setTimeout(checkForUrlChange, 1000);
	}

	function createLinks() {
		if (!window.location.href.includes('Cargo.toml')) {
			return;
		}
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
			if (dependency.children[0].tagName === 'A') {
				// Already converted to a link
				continue;
			}
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
	}

	createLinks();
	checkForUrlChange();
})();