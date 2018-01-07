module.exports = {
  port: 3080,
  host: "185.22.232.114",
  env: "production",
  smtp_login: process.env.SMTP_LOGIN,
  smtp_password: process.env.SMTP_PASSWORD,
  smtp_host: process.env.SMTP_HOST,
  email_from: process.env.EMAIL_FROM,
  secret: process.env.APPLICATION_SECRET,
}
