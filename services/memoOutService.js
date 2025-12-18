const MemoOut = require('../models/memoOut/memoOut');
const Stock = require('../models/stock/stock');
const Consignment = require('../models/consignment/consignment');
const { generateMemoOutInvoiceNo, generateNextInvoiceNo } = require('../helpers/invoiceHelper');

exports.createMemoOut = async (data) => {
    const countData = await MemoOut.countDocuments();
    const invoiceNo = await generateMemoOutInvoiceNo(countData, 3);

    const stockIds = data.items.filter(i => i.type === "Pmr.").map(i => i._id);
    const consignmentIds = data.items.filter(i => i.type === "Cons.").map(i => i._id);

    const stockItems = stockIds.length > 0 ? await Stock.find({ _id: { $in: stockIds } }) : [];
    const consignmentItems = consignmentIds.length > 0 ? await Consignment.find({ _id: { $in: consignmentIds } }) : [];

    for (const item of data.items) {
        let stockItem, consignmentItem;

        if (item.type === "Pmr.") {
            stockItem = stockItems.find(s => s._id.toString() === item._id);
            if (!stockItem) throw new Error(`Stock not found for item: ${item._id}`);
            if (stockItem.pcs < item.pcs) throw new Error(`Insufficient pcs for stock: ${item._id}. Available: ${stockItem.pcs}, Requested: ${item.pcs}`);
            await Stock.updateOne(
                { _id: stockItem._id },
                { $inc: { pcs: -item.pcs, memoout_pcs: item.pcs } }
            );
        } else if (item.type === "Cons.") {
            consignmentItem = consignmentItems.find(c => c._id.toString() === item._id);
            if (!consignmentItem) throw new Error(`Consignment not found for item: ${item._id}`);
            if (consignmentItem.pcs < item.pcs) throw new Error(`Insufficient pcs for consignment: ${item._id}. Available: ${consignmentItem.pcs}, Requested: ${item.pcs}`);
            await Consignment.updateOne(
                { _id: consignmentItem._id },
                { $inc: { pcs: -item.pcs, memoout_pcs: item.pcs } }
            );
        } else {
            throw new Error(`Invalid type for item: ${item._id}`);
        }
    }

    const memoOut = new MemoOut({
        ...data,
        invoice_no: invoiceNo,
        items: data.items,
    });

    return await memoOut.save();
};

exports.updateMemoOut = async (id, updateData) => {
    return await MemoOut.findByIdAndUpdate(id, updateData, { new: true });
};

exports.getNextInvoiceNo = async () => {
    try {
        return await generateNextInvoiceNo('MO', MemoOut);
    } catch (error) {
        throw new Error('Failed to generate next invoice number: ' + error.message);
    }
};

exports.getAllMemoOuts = async () => {
    return await MemoOut.find().populate("currency").populate("vendor_code_id");
};

exports.getMemoOutById = async (id) => {
    return await MemoOut.findById(id).populate("currency").populate("account").populate("vendor_code_id");
};
const { Decimal128 } = require('mongodb'); // ensure this is imported

exports.getAllMemoOutItems = async (filter = {}) => {
    const query = {};
    if (filter.account) {
        query.account = { $regex: new RegExp(`^${filter.account}$`, "i") };
    }

    const memoOuts = await MemoOut.find(query).lean(); // lean gives you plain JS objects

    const items = memoOuts.flatMap(memoOut => {
        if (!memoOut || !Array.isArray(memoOut.items)) return [];

        return memoOut.items.filter(item => item.pcs > 0).map(item => {
            const cleanedItem = {
                ...item,
                invoice_no: memoOut.invoice_no,
                doc_date: memoOut.doc_date,
                remark: memoOut.remark,
                from_memo_out: true,
                memo_out_id: memoOut._id
            };

            // List of Decimal128 fields to convert
            const decimalFields = [
                "weight",
                "price",
                "amount",
                "other_price",
                "discount_percent",
                "discount_amount",
                "total_amount"
            ];

            for (const field of decimalFields) {
                const val = cleanedItem[field];
                if (val && typeof val === "object" && "$numberDecimal" in val) {
                    cleanedItem[field] = parseFloat(val.$numberDecimal);
                } else if (val instanceof Decimal128) {
                    cleanedItem[field] = parseFloat(val.toString());
                }
            }

            return cleanedItem;
        });
    });

    return items;
};