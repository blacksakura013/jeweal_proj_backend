const subLocationService = require('../services/subLocationService');

exports.createSubLocation = async (request, reply) => {
  try {
    const subLocationData = request.body;
    const newSubLocation = await subLocationService.createSubLocation(subLocationData);
    reply.code(201).send(newSubLocation);
  } catch (err) {
    reply.code(500).send({ message: 'Failed to create sub-location', error: err.message });
  }
};

exports.getAllSubLocations = async (request, reply) => {
  try {
    const subLocations = await subLocationService.getAllSubLocations();
    reply.code(200).send(subLocations);
  } catch (err) {
    reply.code(500).send({ message: 'Failed to fetch sub-locations', error: err.message });
  }
};

exports.getSubLocationById = async (request, reply) => {
  try {
    const id = request.params.id;
    const subLocation = await subLocationService.getSubLocationById(id);

    if (!subLocation) {
      return reply.code(404).send({ message: 'Sub-location not found' });
    }

    reply.code(200).send(subLocation);
  } catch (err) {
    reply.code(500).send({ message: 'Failed to fetch sub-location', error: err.message });
  }
};



exports.updateSubLocation = async (request, reply) => {
  try {
    const updatedSubLocation = await subLocationService.updateSubLocation(request.params.id, request.body);
    if (!updatedSubLocation) {
      return reply.code(404).send({ message: 'Sub Location not found' });
    }
    reply.code(200).send(updatedSubLocation);
  } catch (err) {
    reply.code(500).send({ message: 'Failed to update sub location', error: err.message });
  }
};

exports.toggleSubLocationStatus = async (request, reply) => {
  try {
    const id = request.params.id;
    const updatedSubLocation = await subLocationService.toggleSubLocationStatus(id);

    reply.code(200).send(updatedSubLocation);
  } catch (err) {
    reply.code(500).send({ message: 'Failed to toggle sub-location status', error: err.message });
  }
};
