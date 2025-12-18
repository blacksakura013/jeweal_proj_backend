const locationService = require('../services/locationService');

exports.createLocation = async (request, reply) => {
  try {
    const locationData = request.body;
    const newLocation = await locationService.createLocation(locationData);
    reply.code(201).send(newLocation);
  } catch (err) {
    reply.code(500).send({ message: 'Failed to create location', error: err.message });
  }
};

exports.getAllLocations = async (request, reply) => {
  try {
    const locations = await locationService.getAllLocations();
    reply.code(200).send(locations);
  } catch (err) {
    reply.code(500).send({ message: 'Failed to fetch locations', error: err.message });
  }
};

exports.getLocationById = async (request, reply) => {
  try {
    const id = request.params.id;
    const location = await locationService.getLocationById(id);

    if (!location) {
      return reply.code(404).send({ message: 'Location not found' });
    }

    reply.code(200).send(location);
  } catch (err) {
    reply.code(500).send({ message: 'Failed to fetch location', error: err.message });
  }
};

exports.updateLocation = async (request, reply) => {
  try {
    const updatedLocation = await locationService.updateLocation(request.params.id, request.body);
    if (!updatedLocation) {
      return reply.code(404).send({ message: 'Location not found' });
    }
    reply.code(200).send(updatedLocation);
  } catch (err) {
    reply.code(500).send({ message: 'Failed to update location', error: err.message });
  }
};

exports.toggleLocationStatus = async (request, reply) => {
  try {
    const id = request.params.id;
    const updatedLocation = await locationService.toggleLocationStatus(id);

    reply.code(200).send(updatedLocation);
  } catch (err) {
    reply.code(500).send({ message: 'Failed to toggle location status', error: err.message });
  }
};



exports.getAllActiveLocations = async (request, reply) => {
  try {
    const locations = await locationService.getAllActiveLocations();
    reply.code(200).send(locations);
  } catch (err) {
    reply.code(500).send({ message: 'Failed to fetch active locations', error: err.message });
  }
};