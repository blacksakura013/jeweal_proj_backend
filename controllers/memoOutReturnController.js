const memoOutReturnService = require('../services/memoOutReturnService');

exports.createMemoOutReturn = async (req, reply) => {
    try {
        const memoOutReturn = await memoOutReturnService.createMemoOutReturn(req.body);
        reply.send(memoOutReturn);
    } catch (error) {
        reply.code(400).send({ error: error.message });
    }
};

exports.updateMemoOutReturn = async (req, reply) => {
    try {
        const updated = await memoOutReturnService.updateMemoOutReturn(req.params.id, req.body);
        reply.send(updated);
    } catch (error) {
        reply.code(400).send({ error: error.message });
    }
};

exports.getNextInvoiceNo = async (req, reply) => {
    try {
        const invoiceNo = await memoOutReturnService.getNextInvoiceNo();
        reply.send({ invoice_no: invoiceNo });
    } catch (error) {
        reply.code(400).send({ error: error.message });
    }
};

exports.getAllMemoOutReturns = async (req, reply) => {
    try {
        const memoOutReturns = await memoOutReturnService.getAllMemoOutReturns();
        reply.send(memoOutReturns);
    } catch (error) {
        reply.code(400).send({ error: error.message });
    }
};

exports.getMemoOutReturnById = async (req, reply) => {
    try {
        const memoOutReturn = await memoOutReturnService.getMemoOutReturnById(req.params.id);
        reply.send(memoOutReturn);
    } catch (error) {
        reply.code(400).send({ error: error.message });
    }
};