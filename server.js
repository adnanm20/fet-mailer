const express = require("express")
const app = express();
const http = require('http');
const path = require('path');
const bodyParser = require('body-parser');
const session = require("express-session");
const googleClient = require("./googleClient.json");
const {OAuth2Client} = require('google-auth-library');
const dbConnection = require("./dbConnection").getConnection();
const scraper = require('./scraper');

app.use(session({ secret: "123" }));
app.use(bodyParser.urlencoded({ extended: true }));
//app.use(express.static('public'));
app.get("/", (req, res) => {
	res.sendFile(path.join(__dirname, "public/index.html"));
});

app.post("/login", (req, res) => {
	testToken(req.body.id).then((email) => {
		if(email)
		{
			createUser(email).then((userid) => {
				req.session.userid = userid;
				res.redirect("/?loggedin");
			});
		}
	});
});

app.post("/submit", (req, res) => {
	if(req.session.userid)
	{
		setDataForUser(req.session.userid, req.body).then(() => {
			res.send("ok");
		}).catch(() => {
			console.log(123);
		});
	}
	else
	{
		res.send("nolog");
	}
});

app.post("/choices", (req, res) => {
	getChoicesOfUserId(req.session.userid).then((choices) => {
		res.send(choices)
	});
});

app.post("/posts", (req, res) => {
	scraper.getPosts().then((posts) => {
		res.send(posts)
	}).catch(e => console.log(e));
});

app.get("/logout", (req, res) => {
	req.session.destroy();
	res.redirect("/");
})

//local
const port = 8080;
http.createServer(app).listen(port, () => {
	console.log("listening on port: " + port.toString());
});


//email -> users => id
//id -> relations => label_id, state
//label_id -> labels => name


function createUser(email) {
	return new Promise(function (resolve, reject) {
		var query = `SELECT id FROM users WHERE email = ?;`;
		dbConnection.query(query, [email], function (err, res) {
			if(err)
			{
				console.log(err);
				reject();
			}
			if(res.length == 0)
			{
				var query = `INSERT INTO users (email) VALUES (?);`;
				dbConnection.query(query, [email], function (err, res) {
					if(err)
					{
						console.log(err);
						reject();
					}
					resolve(res.insertId);
				});
			}
			else
			{
				resolve(res[0].id);
			}
		});
	})
}

function setDataForUser(userid, data) {
	return new Promise(function (resolve, reject) {
		getChoicesOfUserId(userid).then((choices) => {
			for(i = 0; i < choices.length; i++)
			{
				choices[i].newState = data['ch-' + choices[i].id];
			}
			var query = "";
			choices.filter(el => el.state != el.newState).forEach(choice => {
				if(choice.state != 2)
				{
					if(choice.newState == 2)
					{
						query += `DELETE FROM relations WHERE label_id = ${choice.id} AND user_id = ${userid};`;
					}
					else
					{
						query += `UPDATE relations SET state = ${choice.newState} WHERE label_id = ${choice.id} AND user_id = ${userid};`;
					}
				}
				else
				{
					query += `INSERT INTO relations (label_id, user_id, state) VALUES (${choice.id}, ${userid}, ${choice.newState});`;
				}
			});
			if(query != "")
			{
				dbConnection.query(query, function (err) {
					if(err)
					{
						console.log(err);
						reject();
					}
					resolve();
				});
			}
			resolve();
		}).catch(() => {
			reject();
		});
	})
}

function getChoicesOfUserId(id) {
	return new Promise(function (resolve, reject) {
		var query = `SELECT l.id, l.name, r.state
		FROM labels l
		LEFT JOIN relations r ON l.id = r.label_id AND r.user_id = ?
		ORDER BY l.id;`;
		dbConnection.query(query, [id], (err, res) => {
			if(err)
			{
				console.log(err);
				reject();
			}
			if(res.length > 0)
			{
				var data = [];
				res.forEach(label => {
					data.push({
						id: label.id,
						name: label.name,
						state: (label.state == null ? 2 : label.state)
					});
				});
				resolve(data);
			}
		});
	})
}

function testToken(token) {	
	return new Promise(async function (resolve, reject) {
		const client = new OAuth2Client(googleClient.web.client_id);
		const ticket = await client.verifyIdToken({
			idToken: token,
			audience: googleClient.web.client_id,
		});
		const payload = ticket.getPayload();
		resolve(payload['email']);
	});
}
