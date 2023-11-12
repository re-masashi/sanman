module.exports = {
	globDirectory: 'static/',
	globPatterns: [
		'**/*.{js,html,jpg,json,png,css}'
	],
	swDest: 'static/sw.js',
	ignoreURLParametersMatching: [
		/^utm_/,
		/^fbclid$/
	]
};