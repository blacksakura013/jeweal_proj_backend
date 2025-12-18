const SubLocation = require('../models/subLocation/subLocation');

exports.createSubLocation = async (subLocationData) => {
  const subLocation = new SubLocation(subLocationData);
  return await subLocation.save();
};

exports.getAllSubLocations = async () => {
  return await SubLocation.find();
};

exports.getSubLocationById = async (id) => {
  return await SubLocation.findById(id);
};

exports.updateSubLocation = async (id, updateData) => {
  return await SubLocation.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true,
  });
};
exports.toggleSubLocationStatus = async (id) => {
  const subLocation = await SubLocation.findById(id);
  if (!subLocation) {
    throw new Error('Sub-location not found');
  }

  subLocation.status = subLocation.status === 'active' ? 'inactive' : 'active';
  return await subLocation.save();
};
