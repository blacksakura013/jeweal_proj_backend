const POModel = require("../models/inventory/InventoryIn");
const { generatePOInvoiceNo } = require("../helpers/invoiceHelper");

// Create new PO
exports.createPO = async (data) => {
  const countData = await POModel.countDocuments({
    inventory_type: "purchase_po",
  });
  const invoiceNumber = generatePOInvoiceNo(countData, 3);
  const newPO = new POModel({ ...data, invoice_no: invoiceNumber });
  return await newPO.save();
};

// Get all POs
exports.getAllPOs = async () => {
  return await POModel.find({ inventory_type: "purchase_po" })
    .populate("currency")
    .populate("account");
};

// Get PO by ID
exports.getPOById = async (id) => {
  return await POModel.findById(id).populate("currency").populate("account");
};

// Update PO
exports.updatePO = async (id, data) => {
  return await POModel.findOneAndUpdate(
    { _id: id, inventory_type: "purchase_po" },
    data,
    { new: true }
  );
};


// Generate next PO invoice number
const invoiceHelp = require("../helpers/invoiceHelper.js");
const InventoryIn = require("../models/inventory/InventoryIn");
const inventoryInModel = require("../models/inventory/InventoryIn.js");
const InventoryInPipeline = require("../models/inventory/InventoryInPipeLine.js");

const getPrefix = (inventory_type) => {
  switch (inventory_type) {
    case "memo_in":
      return "MI";
      break;

    case "purchase_po":
      return "PO";
      break;

    case "purchase_pu":
      return "PU";

      break;

    default:
      return "";
  }
};
exports.createInventoryIn = async (payload) => {
  const countInvoiceNumber = await countInvoice(payload.inventory_type);
  const invoiceNumber = invoiceHelp.generateInvoiceNo(
    getPrefix(payload.inventory_type),
    countInvoiceNumber
  );

  let data = payload;
  data.invoice_no = invoiceNumber;
  await inventoryInModel.create(data);
  return data;
};

exports.updateInventoryIn = async (_id, payloadData) => {
  return inventoryInModel.findOneAndUpdate({ _id: _id }, payloadData, {
    new: true,
  });
};

exports.getInventoryList = async (inventory_type) => {
  // const inventoryInData = inventoryInModel.find({inventory_type:inventory_type});
  const pipeline = InventoryInPipeline.InventoryInListPipeline(inventory_type);
  const inventoryInData = inventoryInModel.aggregate(pipeline);

  return inventoryInData;
};

const countInvoice = async (type) => {
  // สร้างโมเดล
  return await inventoryInModel.countDocuments({ inventory_type: type });
};

exports.getInvoiceNo = async (inventory_type) => {
  const countInvoiceNumber = await countInvoice(inventory_type);
  const invoiceNumber = invoiceHelp.generateInvoiceNo(
    getPrefix(inventory_type),
    countInvoiceNumber
  );
  return invoiceNumber;
};

exports.getNextInvoiceNo = async () => {
  try {
    const currentYear = new Date().getFullYear().toString().slice(-2);
    const currentMonth = (new Date().getMonth() + 1)
      .toString()
      .padStart(2, "0");
    const lastQuotation = await InventoryIn.findOne({
      inventory_type: "purchase_po",
      invoice_no: { $regex: `^PO${currentYear}${currentMonth}` },
    })
      .sort({ invoice_no: -1 })
      .select("invoice_no");

    let nextInvoiceNo;

    if (lastQuotation && lastQuotation.invoice_no) {
      const lastNumber = parseInt(lastQuotation.invoice_no.slice(-3), 10);
      nextInvoiceNo = `PO${currentYear}${currentMonth}${(lastNumber + 1)
        .toString()
        .padStart(3, "0")}`;
    } else {
      nextInvoiceNo = `PO${currentYear}${currentMonth}001`;
    }

    return nextInvoiceNo;
  } catch (error) {
    throw new Error("Failed to generate next invoice number: " + error.message);
  }
};

// Get PO by invoice number
exports.getPOByInvoiceNo = async (invoiceNo) => {
  try {
    const po = await POModel.findOne({ invoice_no: invoiceNo }).populate(
      "account"
    );
    if (!po) {
      throw new Error("PO not found");
    }
    return po;
  } catch (error) {
    throw new Error("Failed to fetch PO: " + error.message);
  }
};

exports.getAllApprovePOsByAccount = async (account) => {
  return await POModel.find({
    inventory_type: "purchase_po",
    status: "approved",
    account: account
  })
    .populate("currency")
    .populate("account");
};