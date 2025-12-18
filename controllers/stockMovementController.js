const stockMovementService = require('../services/stockMovementService');

exports.getStockMovementList = async (req, reply) => {
    try {
        const stockMovements = await stockMovementService.getStockMovementList();

        req.server.io.emit('stock-movement-updated', stockMovements);// realtime

        return reply.status(200).send({
            message: "Stock movements fetched successfully",
            data: stockMovements,
        });
    } catch (error) {
        return reply.status(500).send({ error: error.message });
    }
};
exports.getStockMovementsByStoneCode = async (request, reply) => {
    try {
      const { stoneCode } = request.params;
      const stockMovements = await stockMovementService.getStockMovementsByStoneCode(stoneCode);
      if (!stockMovements || stockMovements.length === 0) {
          return reply.status(404).send({ message: "No stock movements found for this stone code" });
      }
      reply.send(stockMovements);
  } catch (error) {
      console.error(error);
      return reply.status(500).send({ message: 'Failed to retrieve stock movements', error: error.message });
  }
};