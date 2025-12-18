const MemoOutReturn = require('../models/memoOutReturn/memoOutReturn');
const MemoOut = require('../models/memoOut/memoOut');
const Stock = require('../models/stock/stock');
const Consignment = require('../models/consignment/consignment');
const { generateMemoOutReturnInvoiceNo, generateNextInvoiceNo } = require('../helpers/invoiceHelper');

exports.createMemoOutReturn = async (data) => {
    const countData = await MemoOutReturn.countDocuments();
    const invoiceNo = await generateMemoOutReturnInvoiceNo(countData, 3);

    if (!data.memo_out_id) throw new Error('memo_out_id is required');

    const memoOut = await MemoOut.findById(data.memo_out_id);
    if (!memoOut) throw new Error('MemoOut not found');

    for (const item of data.items) {
        const memoOutItem = memoOut.items.find(i => i._id.toString() === item.memo_out_item_id);
        if (!memoOutItem) throw new Error(`Item not found in MemoOut: ${item.memo_out_item_id}`);

        if (memoOutItem.pcs < item.pcs) {
            throw new Error(`Insufficient pcs in MemoOut for item ${item.memo_out_item_id}. Available: ${memoOutItem.pcs}, Requested: ${item.pcs}`);
        }

        memoOutItem.pcs -= item.pcs;

        // ตัดจำนวนใน Stock หรือ Consignment
        if (item.type === "Pmr.") {
            const stock = await Stock.findOne({ _id: item.memo_out_item_id });
            if (!stock) throw new Error(`Stock not found: ${item.memo_out_item_id}`);
            if (stock.memoout_pcs < item.pcs) throw new Error(`Insufficient memoout_pcs in stock: ${item.memo_out_item_id}`);
            await Stock.updateOne(
                { _id: item.memo_out_item_id },
                { $inc: { memoout_pcs: -item.pcs, pcs: item.pcs } }
            );
        } else if (item.type === "Cons.") {
            const consignment = await Consignment.findOne({ _id: item.memo_out_item_id });
            if (!consignment) throw new Error(`Consignment not found: ${item.memo_out_item_id}`);
            if (consignment.memoout_pcs < item.pcs) throw new Error(`Insufficient memoout_pcs in consignment: ${item.memo_out_item_id}`);
            await Consignment.updateOne(
                { _id: item.memo_out_item_id },
                { $inc: { memoout_pcs: -item.pcs, pcs: item.pcs } }
            );
        } else {
            throw new Error(`Invalid type for item: ${item.memo_out_item_id}`);
        }
    }

    await memoOut.save();

    const memoOutReturn = new MemoOutReturn({
        ...data,
        invoice_no: invoiceNo,
        items: data.items,
    });

    return await memoOutReturn.save();
};

exports.updateMemoOutReturn = async (id, updateData) => {
    return await MemoOutReturn.findByIdAndUpdate(id, updateData, { new: true });
};

exports.getNextInvoiceNo = async () => {
    try {
        return await generateNextInvoiceNo('MOR', MemoOutReturn);
    } catch (error) {
        throw new Error('Failed to generate next invoice number: ' + error.message);
    }
};

exports.getAllMemoOutReturns = async () => {
    return await MemoOutReturn.find().populate("currency").populate("vendor_code_id");
};

exports.getMemoOutReturnById = async (id) => {
    return await MemoOutReturn.findById(id).populate("currency").populate("account").populate("vendor_code_id");
};