const memoReturnService = require('../services/memoReturnService');

exports.createMemoReturn = async (req, reply) => {
    console.log("hello");
    try {
        const memoReturn = await memoReturnService.createMemoReturn(req.body);
        reply.code(201).send({ message: 'Memo Return created successfully', memoReturn });
    } catch (error) {
        reply.code(500).send({ error: error.message });
    }
};

exports.updateMemoReturn = async (req, reply) => {
    try {
        const updatedMemoReturn = await memoReturnService.updateMemoReturn(req.params.id, req.body);
        if (!updatedMemoReturn) return reply.code(404).send({ message: 'Memo Return not found' });
        reply.code(200).send({ message: 'Memo Return updated successfully', updatedMemoReturn });
    } catch (error) {
        reply.code(500).send({ error: error.message });
    }
};

exports.getNextInvoiceNo = async (req, reply) => {
    try {
        const nextInvoiceNo = await memoReturnService.getNextInvoiceNo();
        reply.code(200).send({ next_invoice_no: nextInvoiceNo });
    } catch (error) {
        reply.code(500).send({ error: error.message });
    }
};

exports.getAllMemoReturns = async (req, reply) => {
    try {
        const memoReturns = await memoReturnService.getAllMemoReturns();
        reply.code(200).send(memoReturns);
    } catch (error) {
        reply.code(500).send({ error: error.message });
    }
};

exports.getMemoReturnById = async (req, reply) => {
    try {
        const memoReturn = await memoReturnService.getMemoReturnById(req.params.id);
        if (!memoReturn) return reply.code(404).send({ message: 'Memo Return not found' });
        reply.code(200).send(memoReturn);
    } catch (error) {
        reply.code(500).send({ error: error.message });
    }
};



exports.getAllMemoReturnItems = async (req, reply) => {
    try {
        const { account } = req.query;

        if (!account) {
            throw new Error("Account is required");
        }

        const memoReturns = await memoReturnService.getAllMemoReturnItems({ account });


        const filterData = Array.isArray(memoReturns)
            ? memoReturns.flatMap((memo) => {
                if (!memo || !Array.isArray(memo.items)) return [];

                return memo.items
                    .filter((item) => item && item._doc) 
                    .map((item) => ({
                        ...item._doc,
                        invoice_no: memo.invoice_no ?? null,
                        doc_date: memo.doc_date ?? null,
                        due_date: memo.due_date ?? null,
                    }));
            })
            : [];

        reply.code(200).send(filterData);
    } catch (error) {
        reply.code(500).send({ error: error.message });
    }
};