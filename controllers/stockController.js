const stockService = require('../services/stockService');

exports.createStock = async (request, reply) => {
  try {
    const stockData = request.body; 
    const newStock = await stockService.createStock(stockData);
    reply.code(201).send(newStock);
  } catch (error) {
    console.error(error);
    reply.code(500).send({ message: 'Failed to create stock', error: error.message });
  }
};


exports.getAllStocks = async (request, reply) => {
  try {
    const stocks = await stockService.getAllStocks();
    reply.code(200).send(stocks);
  } catch (error) {
    console.error(error);
    reply.code(500).send({ message: 'Failed to retrieve stocks', error: error.message });
  }
};

exports.getStockById = async (request, reply) => {
  try {
    const { id } = request.params; 
    const stock = await stockService.getStockById(id);
    reply.code(200).send(stock);
  } catch (error) {
    console.error(error);
    reply.code(404).send({ message: error.message });
  }
};



exports.getAllStocksAndConsignments = async (request, reply) => {
  try {
      const data = await stockService.getAllStocksAndConsignments();
      reply.code(200).send(data);
  } catch (error) {
      console.error(error);
      reply.code(500).send({ message: 'Failed to retrieve stocks and consignments', error: error.message });
  }
};


