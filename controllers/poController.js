const poService = require("../services/poService");
const { Decimal128 } = require("mongoose").Types; 
exports.createPO = async (req, reply) => {
  try {
    const newPO = await poService.createPO(req.body);
    reply.code(201).send(newPO);
  } catch (error) {
    reply.code(500).send({ error: error.message });
  }
};

exports.getAllPOs = async (req, reply) => {
  try {
    const pos = await poService.getAllPOs();
    reply.code(200).send(pos);
  } catch (error) {
    reply.code(500).send({ error: error.message });
  }
};

exports.getPOById = async (req, reply) => {
  try {
    const po = await poService.getPOById(req.params.id);
    if (!po) return reply.code(404).send({ message: "PO not found" });
    reply.code(200).send(po);
  } catch (error) {
    reply.code(500).send({ error: error.message });
  }
};

exports.updatePO = async (req, reply) => {
  try {
    const updatedPO = await poService.updatePO(req.params.id, req.body);
    if (!updatedPO) return reply.code(404).send({ message: "PO not found" });
    reply.code(200).send(updatedPO);
  } catch (error) {
    reply.code(500).send({ error: error.message });
  }
};

exports.getNextInvoiceNo = async (req, reply) => {
  console.log("hello");
  try {
    const nextInvoiceNo = await poService.getNextInvoiceNo();
    console.log(nextInvoiceNo, "nextInvoiceNo");
    reply.code(200).send({ next_invoice_no: nextInvoiceNo });
  } catch (error) {
    reply.code(500).send({ error: error.message });
  }
};
exports.getPOByInvoiceNo = async (req, reply) => {
  try {
    const { invoice_no } = req.params;
    const po = await poService.getPOByInvoiceNo(invoice_no);
    reply.code(200).send(po);
  } catch (error) {
    reply.code(404).send({ message: error.message });
  }
};

exports.getAllApprovePOsByAccount = async (req, reply) => {
  try {
    const { account } = req.query;
    const pos = await poService.getAllApprovePOsByAccount(account);
    reply.code(200).send(pos);
  } catch (error) {
    reply.code(500).send({ error: error.message });
  }
};

exports.approvePO = async (req, reply) => {
  try {
    const updatedPO = await poService.updatePO(req.params.id, { status: "approved" });
    if (!updatedPO) return reply.code(404).send({ message: "PO not found" });
    reply.code(200).send({
      status: updatedPO.status,
      invoice_no: updatedPO.invoice_no
    });
  } catch (error) {
    reply.code(500).send({ error: error.message });
  }
};