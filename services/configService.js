const Config = require('../models/config/config');

exports.createConfig = async (configData) => {
  const config = new Config(configData);
  return await config.save();
};

exports.getAllConfigs = async () => {
  return await Config.find();
};

exports.getConfigById = async (id) => {
  return await Config.findById(id);
};

exports.toggleConfigStatus = async (id) => {
  const config = await Config.findById(id);
  if (!config) {
    throw new Error('Config not found');
  }

  config.status = config.status === 'active' ? 'inactive' : 'active';
  return await config.save();
};
