const emailjs = require("emailjs");
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const app = express();
const jwt = require("jsonwebtoken");
const secret = "8gia89fianfiajsf";

const whitelist = ['http://promo.levelupworlds.com', 'https://promo.levelupworlds.com', 
'http://web.levelupworlds.com', 'https://web.levelupworlds.com', 'http://185.22.232.114'
]
const corsOptions = {
  origin(origin, callback) {
    if (whitelist.indexOf(origin) !== -1) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  }
}

const mailserver = emailjs.server.connect({
	user: "hh@levelupworlds.com",
	password: "dqei901du890y10h",
	host: "smtp.gmail.com",
	ssl: true
});

app.use(bodyParser());
app.use(cors(corsOptions));


app.get("/", function(req, res) {
	res.send(
		"Welcome to Levelup Mail Server! If you are a hacker please get out :)"
	);
});


app.post("/send", function(req, res) {
	if (req.headers["x-access-token"] === secret) {
		const { who, to, subject, html } = req.body;
		if(who && to && subject && html) {
			mailserver.send(
				{
					from: who + "<hh@levelupworlds.com>",
					to: "<" + to + ">",
					subject: subject,
					attachment: [
						{
							data: html,
							alternative: true
						}
					]
				},
				function(err, message) {
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
			res.status(500).json({
				success: false,
				message: "Почтовый сервер получил недостаточное количество данных (ошибка сервера)"
			});
		}
	} else {
		res.status(401).json({
			success: false,
			message: "Неверный токен"
		});
	} 
});

app.listen(3080, function() {
	console.log(" ------------------------------------------");
	console.log(" -> Mail Levelup Server Listening on: 3080!");
});
