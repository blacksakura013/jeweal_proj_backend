const Location = require('../models/location/location');

exports.createLocation = async (locationData) => {
  const location = new Location(locationData);
  return await location.save();
};

exports.getAllLocations = async () => {
  return await Location.find();
};

exports.getLocationById = async (id) => {
  return await Location.findById(id);
};

exports.updateLocation = async (id, updateData) => {
  return await Location.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true,
  });
};

exports.toggleLocationStatus = async (id) => {
  const location = await Location.findById(id);
  if (!location) {
    throw new Error('Location not found');
  }

  location.status = location.status === 'active' ? 'inactive' : 'active';
  return await location.save();
};


exports.getAllActiveLocations = async () => {
  return await Location.find({ status: 'active' });
};