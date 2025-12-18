const Stock = require('../models/stock/stock');
const Consignment = require('../models/consignment/consignment');

exports.getAllStocks = async () => {
  try {
    return await Stock.find({ pcs: { $gt: 0 } }).populate("location");
} catch (error) {
    throw new Error("Failed to fetch stocks: " + error.message);
}
};

exports.getStockById = async (id) => {
  const stock = await Stock.findById(id);
  if (!stock) {
    throw new Error('Stock not found');
  }
  return stock;
};

exports.getAllStocksAndConsignments = async () => {
  try {
      const stocks = await Stock.find({ pcs: { $gt: 0 } });

      const consignments = await Consignment.find({ pcs: { $gt: 0 } });

      return { stocks, consignments };
  } catch (error) {
      throw new Error("Failed to fetch stocks and consignments: " + error.message);
  }
};