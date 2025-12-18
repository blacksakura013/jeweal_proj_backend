const configService = require('../services/configService');

exports.createConfig = async (request, reply) => {
  try {
    const configData = request.body;
    const newConfig = await configService.createConfig(configData);
    reply.code(201).send(newConfig);
  } catch (err) {
    reply.code(500).send({ message: 'Failed to create config', error: err.message });
  }
};

exports.getAllConfigs = async (request, reply) => {
  try {
    const configs = await configService.getAllConfigs();
    reply.code(200).send(configs);
  } catch (err) {
    reply.code(500).send({ message: 'Failed to fetch configs', error: err.message });
  }
};

exports.getConfigById = async (request, reply) => {
  try {
    const id = request.params.id;
    const config = await configService.getConfigById(id);

    if (!config) {
      return reply.code(404).send({ message: 'Config not found' });
    }

    reply.code(200).send(config);
  } catch (err) {
    reply.code(500).send({ message: 'Failed to fetch config', error: err.message });
  }
};

exports.toggleConfigStatus = async (request, reply) => {
  try {
    const id = request.params.id;
    const updatedConfig = await configService.toggleConfigStatus(id);

    reply.code(200).send(updatedConfig);
  } catch (err) {
    reply.code(500).send({ message: 'Failed to toggle config status', error: err.message });
  }
};
