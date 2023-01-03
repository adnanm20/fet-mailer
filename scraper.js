const https = require("https");
const parser = require("node-html-parser");

const getPosts = function () {
	return new Promise (function (resolve, reject) {
		var posts = [];
	
		var options = { 
			hostname: 'groups.google.com',
			path: '/a/fet.ba/g/oglasi/',
			method: 'GET',
			headers: {
			}
		};
		
		var req = https.request(options, (res) => {
			response = "";
			if(res.statusCode != 200)
			{
				reject("scraper.js - Status Code: " + res.statusCode);
			}
			res.on('data', d => {
				response += d.toString()
			})
		
			res.on('end', () => {
				var root = parser.parse(response);
				root.querySelectorAll(".yhgbKd").forEach(element => {
					var labels = [];
					element.querySelectorAll(".taeSte").forEach(label => {
						labels.push(label.childNodes[0]._rawText);
					})
					obj = {
						link: element.querySelector(".ZLl54").attributes.href.slice(22),
						user: element.querySelector(".z0zUgf").childNodes[0]._rawText,
						labels: labels,
						headline: element.querySelector(".o1DPKc").childNodes[0]._rawText
					}
					posts.push(obj);
				});
				resolve(posts);
			});
		});
		
		req.end();
	})
}

module.exports = {
	getPosts
}