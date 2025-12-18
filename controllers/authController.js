const User = require('../models/userModel/userModel');
const bcrypt = require('bcrypt');

module.exports = (fastify) => ({
  
register: async (request, reply) => {
  if (request.isMultipart()) {
    const parts = request.parts();
    let profileImagePath = null;
    const formData = {};

    for await (const part of parts) {
      if (part.file) {
        const uploadDir = require('path').join(__dirname, '..', 'uploads');
        if (!require('fs').existsSync(uploadDir)) {
          require('fs').mkdirSync(uploadDir);
        }
        const filePath = require('path').join(uploadDir, part.filename);
        await require('fs').promises.writeFile(filePath, await part.toBuffer());
        profileImagePath = `/uploads/${part.filename}`;
      } else {
        formData[part.fieldname] = part.value;
      }
    }

    const { username, password, role, email, displayname, phone_No, department, permissions } = formData;
    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = new User({
        username,
        password: hashedPassword,
        role,
        email,
        displayname,
        phone_No,
        department,
        permissions: permissions ? JSON.parse(permissions) : undefined,
        profile_image: profileImagePath
      });
      await newUser.save();
      reply.send({ message: 'User registered' });
    } catch (err) {
      reply.status(500).send({ error: err.message });
    }
  } else {
    const { username, password, role, email, displayname, phone_No, department, permissions } = request.body;
    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = new User({
        username,
        password: hashedPassword,
        role,
        email,
        displayname,
        phone_No,
        department,
        permissions
      });
      await newUser.save();
      reply.send({ message: 'User registered' });
    } catch (err) {
      reply.status(500).send({ error: err.message });
    }
  }
},

  login: async (request, reply) => {
    const { username, password } = request.body;
    try {
      const user = await User.findOne({ username });
      if (!user) return reply.code(401).send({ message: 'Invalid credentials' });
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) return reply.code(401).send({ message: 'Invalid credentials' });

      const token = fastify.jwt.sign({ username: user.username, role: user.role }, { expiresIn: '15d' });
      const refreshToken = fastify.jwt.sign({ username: user.username }, { expiresIn: '30d' });
      user.token = token;
      user.refreshToken = refreshToken;
      await user.save();
      reply.send({ token });
    } catch (err) {
      reply.status(500).send({ error: err.message });
    }
  },

  refreshToken: async (request, reply) => {
    const { refreshToken } = request.body;
    try {
      const decoded = fastify.jwt.verify(refreshToken);
      const user = await User.findOne({ refreshToken });
      if (!user) return reply.code(403).send({ message: 'Invalid refresh token' });
      const newAccessToken = fastify.jwt.sign({ username: user.username, role: user.role }, { expiresIn: '15m' });
      reply.send({ token: newAccessToken });
    } catch (err) {
      reply.status(403).send({ message: 'Invalid refresh token' });
    }
  },

  updatePermissions: async (request, reply) => {
    const { username } = request.params;
    const { permissions } = request.body;
    try {
      await request.jwtVerify();
      if (request.user.role !== 'admin') return reply.code(403).send({ message: 'Access denied' });
      const user = await User.findOne({ username });
      if (!user) return reply.code(404).send({ message: 'User not found' });
      user.permissions = permissions;
      await user.save();
      reply.send({ message: 'Permissions updated successfully', permissions: user.permissions });
    } catch (err) {
      reply.status(500).send({ error: err.message });
    }
  },

  adminOnly: async (request, reply) => {
    try {
      await request.jwtVerify();
      if (request.user.role !== 'admin') return reply.code(403).send({ message: 'Access denied' });
      const user = await User.findOne({ username: request.user.username });
      if (!user) return reply.code(404).send({ message: 'User not found' });
      reply.send({ message: 'Welcome Admin!' });
    } catch (err) {
      reply.status(500).send({ error: err.message });
    }
  },

  userInfo: async (request, reply) => {
    try {
      await request.jwtVerify();
      const user = await User.findOne({ username: request.user.username });
      if (!user) return reply.code(404).send({ message: 'User not found' });
      if (user.role === 'user' || user.role === 'admin') {
        return reply.send({ message: `Hello ${request.user.username}` });
      } else {
        return reply.code(403).send({ message: 'Access denied' });
      }
    } catch (err) {
      reply.status(500).send({ error: err.message });
    }
  }
});