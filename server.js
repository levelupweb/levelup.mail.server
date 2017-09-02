const emailjs = require("emailjs");
const express = require("express");
const bodyParser = require("body-parser");
const whitelist = require('./white.js');
const cors = require("cors");
const app = express();
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const secret = "8gia89fianfiajsf";

dotenv.load();

const mailserver = emailjs.server.connect({
	user: process.env.SMTP_LOGIN,
	password: process.env.SMTP_PASSWORD,
	host: process.env.SMTP_HOST,
	ssl: true
});

const corsOptions = {
  origin(origin, callback) {
    if (whitelist.hosts.indexOf(origin) !== -1) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  }
}

app.use(bodyParser());

if(process.env.APPLICATION_MODE !== 'production') {
	console.log('Running in dev mode')
	app.use(cors());
} else {
	app.use(cors(corsOptions));
}

app.get("/", function(req, res) {
	res.send(
		"Welcome to Levelup Mail Server! If you are a hacker please get out :)"
	);
});


app.post("/send", function(req, res) {
	const { who, to, subject, html } = req.body;
	const token = req.headers["authorization"];
	jwt.verify(token, new Buffer(process.env.APPLICATION_SECRET), (err, decoded) => {
		if(!err && decoded) {
			if(who && to && subject && html) {
				if (whitelist.applications.indexOf(decoded.application_id) !== -1) {
					mailserver.send({
							from: process.env.EMAIL_FROM,
							to: "<" + to + ">",
							subject: subject,
							attachment: [ {
								data: html,
								alternative: true
							}]
						}, function(err, message) {
		console.log(err)
					if (err) return res.status(500).json({
								success: false,
								message: 'Ошибка сервера',
								errors: err
							});
							res.status(200).json({
								message: 'Мы получили ваше сообщение и скоро мы с вами свяжемся',
								success: true
							});
						}
					);
				} else {
					res.status(401).json({
						success: false,
						message: 'Неавторизованное приложение'
					})
				}
			} else {
				res.status(500).json({
					success: false,
					message: "Почтовый сервер получил недостаточное количество данных (ошибка сервера)"
				});
			}
		} else {
			console.log(err);
			res.status(401).json({
				success: false,
				message: "Неверный токен"
			});
		} 
	})
});

app.listen(process.env.APPLICATION_PORT, function() {
	console.log(" -> Levelup Mail on " + process.env.APPLICATION_PORT);
	console.log(" -> Address is " + process.env.APPLICATION_HOST + ':' + process.env.APPLICATION_PORT);
});
