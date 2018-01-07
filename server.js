const emailjs = require("emailjs");
const express = require("express");
const bodyParser = require("body-parser");
const whitelist = require('./white.js');
const cors = require("cors");
const app = express();
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");

dotenv.load();

const config = require("./config");

const mailserver = emailjs.server.connect({
	user: config.smtp_login,
	password: config.smtp_password,
	host: config.smtp_host,
	ssl: true
});

console.log(config.smtp_host)

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

if(config.env !== 'production') {
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
	jwt.verify(token, config.secret, (err, decoded) => {
		if(!err && decoded) {
			if(who && to && subject && html) {
				if (whitelist.applications.indexOf(decoded.application_id) !== -1) {
					mailserver.send({
						from: config.email_from,
						to: "<" + to + ">",
						subject: subject,
						attachment: [ {
							data: html,
							alternative: true
						}]
					}, function(err, message) {
					if (err) { 
						console.log(err); 
						return  res.status(500).json({
							success: false,
							message: 'Ошибка сервера',
							errors: err
						});
					}	
					return res.status(200).json({
							message: 'Мы получили ваше сообщение и скоро мы с вами свяжемся',
							success: true
						});
					});
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

app.listen(config.port, function() {
	console.log(" -> Levelup Mail on " + config.port);
	console.log(" -> Address is " + config.host + ':' + config.port);
});
