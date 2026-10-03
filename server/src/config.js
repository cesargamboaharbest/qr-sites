let fileConfig = {}
try {
  fileConfig = (await import('../config.js')).default
} catch (err) {
  if (err.code !== 'ERR_MODULE_NOT_FOUND') throw err
}

const config = {
  port: Number(process.env.PORT ?? fileConfig.port ?? 4000),
  mongodbUri: process.env.MONGODB_URI ?? fileConfig.mongodbUri,
  jwtSecret: process.env.JWT_SECRET ?? fileConfig.jwtSecret,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? fileConfig.jwtExpiresIn ?? '7d',
  corsOrigin: process.env.CORS_ORIGIN ?? fileConfig.corsOrigin ?? '*',
  dnsServers: process.env.DNS_SERVERS?.split(',') ?? fileConfig.dnsServers ?? [],
}

for (const key of ['mongodbUri', 'jwtSecret']) {
  if (!config[key]) {
    throw new Error(`Missing "${key}". Copy server/config.example.js to server/config.js and fill it in.`)
  }
}

export default config
