const Bank = require('../models/bank/bank');

exports.createBank = async (bankData) => {
  const bank = new Bank(bankData);
  return await bank.save();
};

exports.getAllBanks = async () => {
  return await Bank.find();
};

exports.getBankById = async (id) => {
  return await Bank.findById(id);
};

exports.updateBank = async (id, updateData) => {
  return await Bank.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true,
  });
};

exports.toggleBankStatus = async (id) => {
  const bank = await Bank.findById(id);
  if (!bank) {
    throw new Error('Bank not found');
  }

  bank.status = bank.status === 'active' ? 'inactive' : 'active';
  return await bank.save();
};