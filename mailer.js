const nodemailer = require("nodemailer");
const mailCredentials = require("./mailCredentials.json")[0];

var mailer = nodemailer.createTransport({
	service: 'gmail',
	auth: {
		user: mailCredentials.mail,
		pass: mailCredentials.password
	}
});

var mailOptions = {
	from: mailCredentials.mail,
	to: '',
	subject: '',
	text: ''
};

const sendEmail = function (email, subject, content) {
	mailOptions.to = email;
	mailOptions.subject = subject;
	mailOptions.text = content;
	mailer.sendMail(mailOptions, function (err, info) {});
}

const sendPost = function (emails, post) {
	return new Promise(function (resolve, reject) {
		mailOptions.to = emails.join(", ");
		mailOptions.subject = post.user + " je objavio/la nešto!";
		mailOptions.text = post.headline;
		mailOptions.html = `<p>${post.headline}</p><br><a href="https://groups.google.com/a/fet.ba/g/oglasi/c/${post.link}"> Saznajte više ovdje </a>`
	
		mailer.sendMail(mailOptions, function (err, info) {
			if(err)
			{
				reject();
			}
			else
			{
				resolve();
			}
		});
	})
}


module.exports = {
	sendEmail,
	sendPost
}
