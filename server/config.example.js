// Copy this file to config.js and fill in your values. config.js is gitignored.
// Any value can be overridden with an environment variable of the same name
// in UPPER_SNAKE_CASE (MONGODB_URI, JWT_SECRET, PORT, CORS_ORIGIN).
export default {
  port: 4000,
  mongodbUri:
    'mongodb+srv://<db_username>:<db_password>@cluster0.g8zqdvy.mongodb.net/qr-sites?retryWrites=true&w=majority&appName=Cluster0',
  jwtSecret: '<a long random string>',
  jwtExpiresIn: '7d',
  corsOrigin: 'http://localhost:5173',
  // Optional. Node on Windows sometimes can't resolve mongodb+srv:// records
  // through the system resolver (querySrv ECONNREFUSED). Public DNS fixes it.
  dnsServers: ['1.1.1.1', '8.8.8.8'],
}
