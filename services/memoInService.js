const MemoIn = require("../models/memoIn/memoIn");
const Consignment = require("../models/consignment/consignment");
const { generateMemoInInvoiceNo, generateStockId, generateNextInvoiceNo } = require('../helpers/invoiceHelper'); 

exports.createMemoIn = async (data) => {
  const countData = await MemoIn.countDocuments();
  const invoiceNo = generateMemoInInvoiceNo(countData, 3);

  const itemsWithStockId = data.items.map(item => ({
    ...item,
    stock_id: generateStockId(countData, 5),
  }));

  const memoIn = await MemoIn.create({
    ...data,
    invoice_no: invoiceNo,
    items: itemsWithStockId,
    status: "unapproved"
  });

  return memoIn;
};

exports.getAllMemoIns = async (filter = {}) => {
  const query = {};

  // Case-insensitive account match
  if (filter.account) {
    query.account = { $regex: new RegExp(`^${filter.account}$`, 'i') };
  }

  return await MemoIn.find(query).populate("currency").populate("vendor_code_id");
};

exports.getMemoInById = async (id) => {
  return await MemoIn.findById(id)
  .populate("currency")
  .populate("account").populate("vendor_code_id");
};

exports.updateMemoIn = async (id, updateData) => {
  return await MemoIn.findByIdAndUpdate(id, updateData, { new: true });
};

exports.getNextInvoiceNo = async () => {
    try {
        return await generateNextInvoiceNo('MI', MemoIn);
    } catch (error) {
        throw new Error('Failed to generate next invoice number: ' + error.message);
    }
};

exports.approveMemoIn = async (memoInId) => {
  const memoIn = await MemoIn.findById(memoInId).lean();
  if (!memoIn) throw new Error("Memo In not found");
  if (memoIn.status === "approved") throw new Error("Already approved");

  const consignmentData = (memoIn.items || []).map(item => ({
    image: item.image || null,
    type: "Cons.",
    memo_no: memoIn.invoice_no,
    doc_date: memoIn.doc_date,
    due_date: memoIn.due_date,
    account: memoIn.account,
    ref: memoIn.ref_1 || "N/A",
    ref_no: memoIn.ref_1 || "N/A",
    stone_code: item.stone_code || "N/A",
    stock_id: item.stock_id,
    lot_no: item.lot_no,
    stone: item.stone,
    shape: item.shape,
    size: item.size,
    color: item.color,
    cutting: item.cutting,
    quality: item.quality,
    clarity: item.clarity,
    cer_type: item.cer_type,
    cer_no: item.cer_no,
    pcs: item.pcs,
    weight: item.weight,
          weight_per_piece: item.weight_per_piece,
    price: item.price,
    unit: item.unit,
    amount: item.amount,
    currency: memoIn.currency,
    remark: item.remark,
    discount_percent: item.discount_percent,
    discount_amount: item.discount_amount
  }));

  await Consignment.insertMany(consignmentData);

  await MemoIn.findByIdAndUpdate(memoInId, { status: "approved" });

  return { success: true };
};
