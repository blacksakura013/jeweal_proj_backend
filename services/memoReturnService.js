const MemoReturn = require('../models/memoReturn/memoReturn');
const Consignment = require('../models/consignment/consignment');
const { generateMemoReturnInvoiceNo, generateNextInvoiceNo } = require('../helpers/invoiceHelper');

exports.createMemoReturn = async (data) => {
    const countData = await MemoReturn.countDocuments();
    const invoiceNo = await generateMemoReturnInvoiceNo(countData, 3);

    const consignmentItems = await Consignment.find({
        _id: { $in: data.items.map(item => item._id) },
    });

    const missingItems = data.items.filter(item =>
        !consignmentItems.some(c => c._id.toString() === item._id)
    );

    if (missingItems.length > 0) {
        throw new Error(
            `Some consignment items are not available: ${missingItems
                .map(item => `id: ${item._id}`)
                .join("; ")}`
        );
    }

    for (const item of data.items) {
        let remainingPcs = item.pcs;

        const consignmentItem = consignmentItems.find(c => c._id.toString() === item._id);

        if (!consignmentItem) {
            throw new Error(`Consignment item with id ${item._id} not found.`);
        }

        if (consignmentItem.pcs < remainingPcs) {
            throw new Error(
                `Insufficient pcs for consignment id: ${item._id}. Available: ${consignmentItem.pcs}, Requested: ${remainingPcs}`
            );
        }

        await Consignment.updateOne(
            { _id: consignmentItem._id },
            { $inc: { pcs: -remainingPcs } }
        );
    }

    const memoReturn = new MemoReturn({
        ...data,
        invoice_no: invoiceNo,
        items: data.items,
    });

    return await memoReturn.save();
};

exports.updateMemoReturn = async (id, updateData) => {
    return await MemoReturn.findByIdAndUpdate(id, updateData, { new: true });
};

exports.getNextInvoiceNo = async () => {
    try {
        return await generateNextInvoiceNo('MR', MemoReturn);
    } catch (error) {
        throw new Error('Failed to generate next invoice number: ' + error.message);
    }
};

exports.getAllMemoReturns = async () => {
 return await MemoReturn.find().populate("currency").populate("vendor_code_id");
};

exports.getMemoReturnById = async (id) => {
    return await MemoReturn.findById(id).populate("currency").populate("account").populate("vendor_code_id");
};
exports.getAllMemoReturnItems = async (filter = {}) => {
    const query = {};

      // Case-insensitive account match
    if (filter.account) {
        query.account = { $regex: new RegExp(`^${filter.account}$`, "i") };
    }

    return await MemoReturn.find(query);
};