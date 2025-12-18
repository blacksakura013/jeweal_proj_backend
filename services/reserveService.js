const Reserve = require('../models/reserve/reserve');
const Stock = require('../models/stock/stock');
const Consignment = require('../models/consignment/consignment');
const { generateReserveInvoiceNo, generateNextInvoiceNo } = require('../helpers/invoiceHelper');

exports.createReserve = async (data) => {
    const countData = await Reserve.countDocuments();
    const invoiceNo = await generateReserveInvoiceNo(countData, 3);
    const itemsWithOriginal = (data.items || []).map(item => ({
        ...item,
        original_pcs: item.pcs != null ? item.pcs : 0
    }));

    const reserve = new Reserve({
        ...data,
        invoice_no: invoiceNo,
        items: itemsWithOriginal,
        status_approve: 'unapproved'
    });

    return await reserve.save();
};

exports.updateReserve = async (id, updateData) => {
    if (Array.isArray(updateData.items)) {
        updateData.items = updateData.items.map(item => ({
            ...item,
            original_pcs: item.pcs != null ? item.pcs : item.original_pcs
        }));
    }
    return await Reserve.findByIdAndUpdate(id, updateData, { new: true });
};

exports.getNextInvoiceNo = async () => {
    try {
        return await generateNextInvoiceNo('OD', Reserve);
    } catch (error) {
        throw new Error('Failed to generate next invoice number: ' + error.message);
    }
};

exports.getAllReserves = async () => {
  const reserves = await Reserve.find()
    .populate("currency")
    .populate("account")
    .populate("vendor_code_id");
  return reserves.map(reserve => {
    const reserveObj = reserve.toObject({ getters: true });
    if (reserveObj.status_approve === "approved" && Array.isArray(reserveObj.items)) {
      reserveObj.items = reserveObj.items.map(item => ({
        ...item,
        pcs: item.original_pcs ?? item.pcs 
      }));
    }

    return reserveObj;
  });
};

exports.getReserveById = async (id) => {
    return await Reserve.findById(id).populate("currency").populate("account").populate("vendor_code_id");
};

exports.getAllReturnReservesByAccount = async (account) => {
    const query = { status_approve: 'approved' };
    if (account) {
        query.account = { $regex: new RegExp(`^${account}$`, "i") };
    }
    const reserves = await Reserve.find(query)
        .populate("currency")
        .populate("account")
        .populate("vendor_code_id");

    return reserves
        .map(reserve => {
            const itemsWithFlag = Array.isArray(reserve.items)
                ? reserve.items
                    .filter(item => item.pcs > 0)
                    .map(item => ({
                        ...item.toObject({ getters: true }),
                        from_reserve: true
                    }))
                : [];
            return {
                ...reserve.toObject({ getters: true }),
                items: itemsWithFlag
            };
        })
        .filter(reserveObj => Array.isArray(reserveObj.items) && reserveObj.items.length > 0);
};

exports.autoReleaseReserve = async () => {
    const now = new Date();
    const expiredReserves = await Reserve.find({
        due_date: { $lt: new Date(now.getTime() - 24 * 60 * 60 * 1000) },
        status: 'reserved'
    });

    console.log('Found expired reserves:', expiredReserves.length);

    for (const reserve of expiredReserves) {
        for (const item of reserve.items) {
            console.log('Releasing item:', item);
            if (item.type === "Pmr.") {
                const result = await Stock.updateOne(
                    { _id: item._id },
                    { $inc: { reserved_pcs: -item.pcs, pcs: item.pcs } }
                );
                console.log('Stock update result:', result);
            } else if (item.type === "Cons.") {
                const result = await Consignment.updateOne(
                    { _id: item._id },
                    { $inc: { reserved_pcs: -item.pcs, pcs: item.pcs } }
                );
                console.log('Consignment update result:', result);
            }
        }
        reserve.status = 'released';
        await reserve.save();
    }
};

exports.approveReserve = async (reserveId) => {
    const reserve = await Reserve.findById(reserveId);
    if (!reserve) throw new Error("Reserve not found");
    if (reserve.status_approve === "approved") throw new Error("Already approved");

    const stockIds = reserve.items.filter(i => i.type === "Pmr.").map(i => i._id);
    const consignmentIds = reserve.items.filter(i => i.type === "Cons.").map(i => i._id);

    const stockItems = stockIds.length > 0 ? await Stock.find({ _id: { $in: stockIds } }) : [];
    const consignmentItems = consignmentIds.length > 0 ? await Consignment.find({ _id: { $in: consignmentIds } }) : [];

    for (const item of reserve.items) {
        if (item.type === "Pmr.") {
            const stockItem = stockItems.find(s => s._id.toString() === item._id.toString());
            if (!stockItem) {
                throw new Error(`Stock ID ${item._id} not found in stock.`);
            }
            if (stockItem.pcs < item.pcs) {
                throw new Error(`Insufficient pcs for stock_id: ${item._id}. Available: ${stockItem.pcs}, Requested: ${item.pcs}`);
            }
            await Stock.updateOne(
                { _id: stockItem._id },
                { $inc: { pcs: -item.pcs, reserved_pcs: item.pcs } }
            );
        } else if (item.type === "Cons.") {
            const consignmentItem = consignmentItems.find(c => c._id.toString() === item._id.toString());
            if (!consignmentItem) {
                throw new Error(`Consignment ID ${item._id} not found.`);
            }
            if (consignmentItem.pcs < item.pcs) {
                throw new Error(`Insufficient pcs for consignment_id: ${item._id}. Available: ${consignmentItem.pcs}, Requested: ${item.pcs}`);
            }
            await Consignment.updateOne(
                { _id: consignmentItem._id },
                { $inc: { pcs: -item.pcs, reserved_pcs: item.pcs } }
            );
        } else {
            throw new Error(`Invalid type for _id: ${item._id}`);
        }
    }

    reserve.status_approve = 'approved';
    await reserve.save();

    return reserve;
};