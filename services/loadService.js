const Load = require('../models/load/load');
const Stock = require('../models/stock/stock');
const inventoryPUModel = require('../models/inventory/InventoryIn');
const { generateNextInvoiceNo, generateStockId, generateLoadInvoiceNo } = require('../helpers/invoiceHelper');

exports.createLoad = async (data) => {
    const countData = await Load.countDocuments();
    const invoiceNo = generateLoadInvoiceNo(countData, 3);

    const loadType = data.load_type || "normal";

    // IMPORTANT: Fetch original PU data for pu_item array
    const puItemsWithOriginalData = await Promise.all(
        (data.pu_item || []).map(async (puItem) => {
            try {
                // Fetch original PU data from PU collection
                const originalPUData = await inventoryPUModel.findOne(
                    { 
                        _id: puItem.pu_id, 
                        "items._id": puItem.pu_item_id 
                    },
                    { 
                        "items.$": 1,
                        invoice_no: 1
                    }
                ).lean();

                if (originalPUData && originalPUData.items && originalPUData.items.length > 0) {
                    const originalItem = originalPUData.items[0];
                    return {
                        ...puItem,
                        // Store original data (200 PCS) instead of current data (190 PCS)
                        pcs: originalItem.original_pcs || originalItem.pcs,        // Use original_pcs (200)
                        Pu_no: originalPUData.invoice_no,
                    };
                }
                return puItem;
            } catch (error) {
                console.error(`Error fetching original PU data for ${puItem.pu_item_id}:`, error);
                return puItem;
            }
        })
    );

    const itemsWithStockId = data.load_item.map(item => ({
        ...item,
        stock_id: generateStockId(countData, 5),
    }));

    const load = await Load.create({ 
        ...data, 
        invoice_no: invoiceNo, 
        load_item: itemsWithStockId, 
        pu_item: puItemsWithOriginalData, // Store original PU data (200 PCS)
        status: "unapproved" 
    });
    return load;
};


exports.approveLoad = async (loadId) => {
    const load = await Load.findById(loadId).lean();
    if (!load) throw new Error("Load not found");
    if (load.status === "approved") throw new Error("Already approved");

    const loadType = load.load_type || "normal";
    const itemsWithStockId = load.load_item;

    if (loadType === "normal") {
        for (const item of itemsWithStockId) {
            if (item.pu_id && item.pu_item_id && item.pcs) {
                const puDoc = await inventoryPUModel.findOne(
                    { _id: item.pu_id, "items._id": item.pu_item_id },
                    { "items.$": 1 }
                );
                const pcsInPU = puDoc?.items?.[0]?.pcs ?? 0;
                if (pcsInPU <= 0) {
                    throw new Error(`Cannot approve load: PU item ${item.pu_item_id} has 0 pcs`);
                }
                if (pcsInPU < item.pcs) {
                    throw new Error(`Cannot approve load: PU item ${item.pu_item_id} has only ${pcsInPU} pcs, but requested ${item.pcs}`);
                }
            }
        }
    }

    if (loadType === "merge") {
        for (const item of itemsWithStockId) {
            const puRefs = item.pu_refs || (item.pu_id && item.pu_item_id ? [{ pu_id: item.pu_id, pu_item_id: item.pu_item_id }] : []);
            for (const ref of puRefs) {
                await inventoryPUModel.updateOne(
                    { _id: ref.pu_id, "items._id": ref.pu_item_id },
                    { $set: { "items.$.pcs": 0 } }
                );
            }
        }
    } else if (loadType === "normal") {
        for (const item of itemsWithStockId) {
            if (item.pu_id && item.pu_item_id && item.pcs) {
                const puDoc = await inventoryPUModel.findOne(
                    { _id: item.pu_id, "items._id": item.pu_item_id },
                    { "items.$": 1 }
                );
                if (puDoc && puDoc.items && puDoc.items.length > 0) {
                    const oldPcs = puDoc.items[0].pcs || 0;
                    const newPcs = Math.max(0, oldPcs - item.pcs);
                    await inventoryPUModel.updateOne(
                        { _id: item.pu_id, "items._id": item.pu_item_id },
                        { $set: { "items.$.pcs": newPcs } }
                    );
                }
            }
        }
    }

    const stockData = itemsWithStockId.map(item => ({
          image: item.image || null,
        location: item.location,
        type: "Pmr.",
        load_no: load.invoice_no,
        Pu_no: item.Pu_no,
        doc_date: load.doc_date,
        account: load.account,
        ref: load.ref_1 || "N/A",
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
        price: item.stock_price,
        sale_price: item.sale_price,
        unit: item.unit,
        amount: item.stock_amount,
        sale_amount: item.sale_amount,
        remark: item.remark,
    }));

    await Stock.insertMany(stockData);
    await Load.findByIdAndUpdate(loadId, { status: "approved" });

    return { success: true };
};

exports.getAllLoads = async (filter = {}) => {
    const query = {};

    if (filter.account) {
        query.account = { $regex: new RegExp(`^${filter.account}$`, 'i') };
    }

    return await Load.find(query);
};

exports.getLoadById = async (id) => {
    return await Load.findById(id);
};

exports.updateLoad = async (id, updateData) => {
    return await Load.findByIdAndUpdate(id, updateData, { new: true });
};

exports.getNextInvoiceNo = async () => {
    try {
        return await generateNextInvoiceNo('L', Load);
    } catch (error) {
        throw new Error('Failed to generate next invoice number: ' + error.message);
    }
};