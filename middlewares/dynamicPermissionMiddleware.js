const User = require('../models/userModel/userModel');

async function dynamicPermissionMiddleware(request, reply, done) {
  try {
    await request.jwtVerify();
  } catch (err) {
    return reply.code(403).send({ message: 'Invalid token' });
  }

  const { main, sub, action } = request.params;
  const user = await User.findOne({ username: request.user.username });
  if (!user) return reply.code(404).send({ message: 'User not found' });
  const userPermissions = user.permissions;

  let hasPermission = false;
  if (sub && action) {

    hasPermission = userPermissions?.[main]?.[sub]?.[action];
  } else if (action) {

    hasPermission = userPermissions?.[main]?.[action];
  }

  if (hasPermission) {
    done();
  } else {
    reply.code(403).send({ message: 'Access denied: insufficient permissions' });
  }
}

module.exports = dynamicPermissionMiddleware;