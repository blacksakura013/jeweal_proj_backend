// const fastifyJwt = require('@fastify/jwt');

// exports.generateTokens = (user) => {
//   const token = fastifyJwt.sign({ username: user.username, role: user.role }, { expiresIn: '15d' });
//   const refreshToken = fastifyJwt.sign({ username: user.username }, { expiresIn: '30d' });
//   return { token, refreshToken };
// };

// exports.generateAccessToken = (user) => {
//   return fastifyJwt.sign({ username: user.username, role: user.role }, { expiresIn: '15m' });
// };