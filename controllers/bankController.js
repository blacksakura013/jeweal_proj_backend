const bankService = require('../services/bankService');

exports.createBank = async (request, reply) => {
  try {
    const bankData = request.body;
    const newBank = await bankService.createBank(bankData);
    reply.code(201).send(newBank);
  } catch (err) {
    reply.code(500).send({ message: 'Failed to create bank', error: err.message });
  }
};

exports.getAllBanks = async (request, reply) => {
  try {
    const banks = await bankService.getAllBanks();
    reply.code(200).send(banks);
  } catch (err) {
    reply.code(500).send({ message: 'Failed to fetch banks', error: err.message });
  }
};

exports.getBankById = async (request, reply) => {
  try {
    const id = request.params.id;
    const bank = await bankService.getBankById(id);

    if (!bank) {
      return reply.code(404).send({ message: 'Bank not found' });
    }

    reply.code(200).send(bank);
  } catch (err) {
    reply.code(500).send({ message: 'Failed to fetch bank', error: err.message });
  }
};

exports.updateBank = async (request, reply) => {
  try {
    const updatedBank = await bankService.updateBank(request.params.id, request.body);
    if (!updatedBank) {
      return reply.code(404).send({ message: 'Bank not found' });
    }
    reply.code(200).send(updatedBank);
  } catch (err) {
    reply.code(500).send({ message: 'Failed to update bank', error: err.message });
  }
};

exports.toggleBankStatus = async (request, reply) => {
  try {
    const id = request.params.id;
    const updatedBank = await bankService.toggleBankStatus(id);

    reply.code(200).send(updatedBank);
  } catch (err) {
    reply.code(500).send({ message: 'Failed to toggle bank status', error: err.message });
  }
};