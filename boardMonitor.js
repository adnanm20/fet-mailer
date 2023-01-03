const mailer = require("./mailer");
const scraper = require("./scraper");
const previousPosts = require("./previousPosts.json");
const fs = require("fs");
const db = require("./dbConnection");

scraper.getPosts().then(posts => {
	newPosts = posts.filter(post => {
		if(previousPosts.findIndex(el => el == post.link) < 0)
		{
			previousPosts.push(post.link);
			return 1;
		}
		else
		{
			return 0;
		}
	});
	fs.writeFileSync(__dirname + "/previousPosts.json", JSON.stringify(previousPosts), err => {});
	console.log(newPosts);
	
//	mailer.sendEmail(['maleskicadnan@gmail.com'], "boardMonitor activated", newPosts.length.toString() + " new posts processed!"); 

	newPosts.forEach(post => {
		console.log(post.link);
		getEmails(post.labels).then((emails) => {
			mailer.sendPost(emails, post).then(() => {
				console.log("Email sent!");
			}).catch(() => {
				console.error("Error sending email!");
			});
		}).catch((e) => {console.log(e);})
	});
	
}).catch((e) => {
	console.error(e);
	return;
});

function getEmails(labels) {
	var str;

	if(labels.length == 0)
	{
		str = "'bez oznake'";
	}
	else
	{
		str = "'" + labels.join("', '") + "'";

	}

	var query = `SELECT email FROM users
	WHERE EXISTS 
	(
		SELECT r.id
		FROM relations r
		JOIN labels l ON l.id = r.label_id
		WHERE r.user_id = users.id AND r.state AND l.name IN (${str})
		LIMIT 1
	)
	AND NOT EXISTS
	(
		SELECT r.id
		FROM relations r
		JOIN labels l ON l.id = r.label_id
		WHERE r.user_id = users.id AND NOT r.state AND l.name IN (${str})
		LIMIT 1
	);`;
	return new Promise(function (resolve, reject) {
		let con = db.getConnection();
		con.query(query, function (err, response) {
			con.end();
			if(err)
			{
				console.log(err);
				reject();
			}

			if(response.length > 0)
			{
				emails = response.map(el => el.email);
				resolve(emails);
			}
			else
			{
				console.log("1231421");
				reject();
			}
		});
	})
}
