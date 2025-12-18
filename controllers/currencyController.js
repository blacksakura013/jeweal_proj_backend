const currencyService = require('../services/currencyService');

exports.createCurrency = async (request, reply) => {
  try {
    const savedCurrency = await currencyService.createCurrency(request.body);
    reply.code(201).send(savedCurrency);
  } catch (err) {
    reply.code(500).send({ message: 'Failed to create currency', error: err.message });
  }
};

exports.getAllCurrencies = async (request, reply) => {
  try {
    const currencies = await currencyService.getAllCurrencies();
    reply.code(200).send(currencies);
  } catch (err) {
    reply.code(500).send({ message: 'Failed to fetch currencies', error: err.message });
  }
};

exports.getCurrencyById = async (request, reply) => {
  try {
    const currency = await currencyService.getCurrencyById(request.params.id);
    if (!currency) {
      return reply.code(404).send({ message: 'Currency not found' });
    }
    reply.code(200).send(currency);
  } catch (err) {
    reply.code(500).send({ message: 'Failed to fetch currency', error: err.message });
  }
};

exports.updateCurrency = async (request, reply) => {
  try {
    const updatedCurrency = await currencyService.updateCurrency(request.params.id, request.body);
    if (!updatedCurrency) {
      return reply.code(404).send({ message: 'Currency not found' });
    }
    reply.code(200).send(updatedCurrency);
  } catch (err) {
    reply.code(500).send({ message: 'Failed to update currency', error: err.message });
  }
};

exports.toggleCurrencyStatus = async (request, reply) => {
  try {
    const updatedCurrency = await currencyService.toggleCurrencyStatus(request.params.id);
    reply.code(200).send(updatedCurrency);
  } catch (err) {
    reply.code(500).send({ message: 'Failed to toggle currency status', error: err.message });
  }
};
