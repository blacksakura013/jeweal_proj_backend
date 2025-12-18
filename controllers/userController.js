const User = require('../models/userModel/userModel');

module.exports = {
  getAllUsers: async (req, reply) => {
    try {
      const users = await User.find().select('-password -refreshToken'); 
      reply.send(users);
    } catch (err) {
      reply.status(500).send({ error: err.message });
    }
  },
  getUserByUsername: async (req, reply) => {
    try {
      const { username } = req.params;
      const user = await User.findOne({ username })
        .select('-password -refreshToken');
      if (!user) return reply.code(404).send({ message: 'User not found' });
      reply.send(user);
    } catch (err) {
      reply.status(500).send({ error: err.message });
    }
  }
};