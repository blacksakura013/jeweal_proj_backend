const Sale = require('../models/sale/sale');
const Stock = require('../models/stock/stock');
const { generateSaleInvoiceNo,generateNextInvoiceNo } = require('../helpers/invoiceHelper');
const Consignment = require('../models/consignment/consignment');
const Reserve = require('../models/reserve/reserve');

exports.checkStockAvailability = async (items) => {
  for (const item of items) {
    if (item.type === "Pmr.") {
      const stock = await Stock.findById(item._id);
      if (!stock) {
        throw new Error(`Stock not found for _id: ${item._id}`);
      }
      if (item.from_reserve) {
        if (stock.reserved_pcs < item.pcs) {
          throw new Error(`Reserved stock not available for _id: ${item._id}`);
        }
      } else {
        if (stock.pcs < item.pcs) {
          throw new Error(`Stock not available for _id: ${item._id}`);
        }
      }
    } else if (item.type === "Cons.") {
      const consignment = await Consignment.findById(item._id);
      if (!consignment) {
        throw new Error(`Consignment not found for _id: ${item._id}`);
      }
      if (item.from_reserve) {
        if (consignment.reserved_pcs < item.pcs) {
          throw new Error(`Reserved consignment not available for _id: ${item._id}`);
        }
      } else {
        if (consignment.pcs < item.pcs) {
          throw new Error(`Consignment not available for _id: ${item._id}`);
        }
      }
    } else {
      throw new Error(`Invalid type for _id: ${item._id}`);
    }
  }
};

exports.updateStockQuantities = async (items) => {
  for (const item of items) {
    if (item.type === "Pmr.") {
      if (item.from_reserve) {
        await Stock.updateOne(
          { _id: item._id },
          { $inc: { reserved_pcs: -item.pcs } }
        );
      } else {
        await Stock.updateOne(
          { _id: item._id },
          { $inc: { pcs: -item.pcs } }
        );
      }
    } else if (item.type === "Cons.") {
      if (item.from_reserve) {
        await Consignment.updateOne(
          { _id: item._id },
          { $inc: { reserved_pcs: -item.pcs } }
        );
      } else {
        await Consignment.updateOne(
          { _id: item._id },
          { $inc: { pcs: -item.pcs } }
        );
      }
    } else {
      throw new Error(`Invalid type for _id: ${item._id}`);
    }
  }
};

exports.generateSaleInvoiceNo = async () => {
  try {
      const countData = await Sale.countDocuments(); 
      const invoiceNo = generateSaleInvoiceNo(countData, 3); 
      return invoiceNo;
  } catch (err) {
      console.error('Error generating sale invoice number:', err);
      throw err;
  }
};

// exports.createSale = async (saleData) => {
//   try {
//       const invoiceNo = await exports.generateSaleInvoiceNo(); 
//       const sale = new Sale({ ...saleData, invoice_no: invoiceNo });
//       return await sale.save();
//   } catch (err) {
//       console.error('Error creating sale:', err);
//       throw err;
//   }
// };
exports.createSale = async (saleData) => {
  try {
    const invoiceNo = await exports.generateSaleInvoiceNo();

    await exports.updateStockQuantities(saleData.items);

    const reserveMap = {};
    for (const item of saleData.items) {
      if (item.from_reserve && item.reserve_id && item._id) {
        if (!reserveMap[item.reserve_id]) {
          reserveMap[item.reserve_id] = {};
        }

        reserveMap[item.reserve_id][item._id] = (reserveMap[item.reserve_id][item._id] || 0) + item.pcs;
      }
    }

for (const reserveId of Object.keys(reserveMap)) {
  const reserve = await Reserve.findById(reserveId);
  if (!reserve) continue;

  let allSold = true;

  for (const originalItem of reserve.items) {
    const soldQty = reserveMap[reserveId][originalItem._id.toString()] || 0;
    const remaining = originalItem.pcs - soldQty;


    if (soldQty > 0) {
      originalItem.pcs = Math.max(0, originalItem.pcs - soldQty);
    }

    if (remaining > 0) {
      allSold = false;
    }
  }

  if (allSold) {
    reserve.status = 'sold';
  }
  await reserve.save();
}

      const sale = new Sale({ ...saleData, invoice_no: invoiceNo });
      return await sale.save();
  } catch (err) {
      console.error('Error creating sale:', err);
      throw err;
  }
};

exports.getSaleById = async (id) => {
  const sale = await Sale.findById(id).populate('items.stock_id').populate("currency").populate("account").populate("vendor_code_id");
  if (!sale) {
    throw new Error('Sale not found');
  }
  return sale;
};

exports.getAllSales = async () => {
  return await Sale.find().populate('items.stock_id').populate("currency").populate("vendor_code_id");
};

exports.getNextInvoiceNo = async () => {
    try {
        return await generateNextInvoiceNo('SA', Sale);
    } catch (error) {
        throw new Error('Failed to generate next invoice number: ' + error.message);
    }
};

exports.updateSale = async (id, updateData) => {
  return await Sale.findByIdAndUpdate(id, updateData, { new: true });
};

exports.cancelSale = async (saleId) => {
  const sale = await Sale.findById(saleId).lean();
  if (!sale) throw new Error('Sale not found');
  if (sale.status === 'cancelled') throw new Error('Sale already cancelled');

  const createdStocks = [];
  const createdConsignments = [];

  for (const item of sale.items) {
    const sourceId = item._id

    if (item.type === 'Pmr.') {
      if (item.from_reserve) {
        await Stock.updateOne(
          { _id: sourceId },
          { $inc: { reserved_pcs: item.pcs } }
        );
      } else {
        const src = await Stock.findById(sourceId).lean();
        if (!src) continue;
        const doc = { ...src };
        delete doc._id;
        delete doc.createdAt;
        delete doc.updatedAt;
        doc.pcs = item.pcs;
        doc.reserved_pcs = 0;
        doc.memoout_pcs = 0;
        doc.return_from_sale = sale._id;
        doc.return_sale_no = sale.invoice_no;
        const created = await Stock.create(doc);
        createdStocks.push(created);
      }
    } else if (item.type === 'Cons.') {
      if (item.from_reserve) {
        await Consignment.updateOne(
          { _id: sourceId },
          { $inc: { reserved_pcs: item.pcs } }
        );
      } else {
        const src = await Consignment.findById(sourceId).lean();
        if (!src) continue;
        const doc = { ...src };
        delete doc._id;
        delete doc.createdAt;
        delete doc.updatedAt;
        doc.pcs = item.pcs;
        doc.reserved_pcs = 0;
        doc.memoout_pcs = 0;
        doc.return_from_sale = sale._id;
        doc.return_sale_no = sale.invoice_no;
        const created = await Consignment.create(doc);
        createdConsignments.push(created);
      }
    }

    if (item.from_reserve && item.reserve_id) {
      const reserve = await Reserve.findById(item.reserve_id);
      if (reserve && Array.isArray(reserve.items)) {
        const reserveItem = reserve.items.id(item._id) || reserve.items.find(x => x._id && x._id.toString() === String(item._id));
        if (reserveItem) {
          reserveItem.pcs = (reserveItem.pcs || 0) + item.pcs;
        }

        if (reserve.status === 'sold') reserve.status = 'reserved';
        await reserve.save();
      }
    }
  }

  await Sale.findByIdAndUpdate(saleId, { status: 'cancelled', cancelled_at: new Date() });

  return {
    saleId,
    createdStocksCount: createdStocks.length,
    createdConsignmentsCount: createdConsignments.length
  };
};