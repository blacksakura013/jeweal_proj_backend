const Currency = require('../models/currency/currency');

exports.createCurrency = async (currencyData) => {
  const currency = new Currency(currencyData);
  return await currency.save();
};

exports.getAllCurrencies = async () => {
  return await Currency.find();
};

exports.getCurrencyById = async (id) => {
  return await Currency.findById(id);
};

exports.updateCurrency = async (id, updateData) => {
  return await Currency.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true,
  });
};

exports.toggleCurrencyStatus = async (id) => {
  const currency = await Currency.findById(id);
  if (!currency) {
    throw new Error('Currency not found');
  }
  currency.status = currency.status === 'active' ? 'inactive' : 'active';
  return await currency.save();
};