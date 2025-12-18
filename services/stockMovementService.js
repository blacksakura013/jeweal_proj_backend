const StockMovement = require('../models/stockMovement/stockMovement');

const Load = require('../models/load/load');
const Sale = require('../models/sale/sale');

exports.getStockMovementList = async () => {

  const loads = await Load.find({}, { load_item: 1, doc_date: 1, due_date: 1 }).lean();
  const inMap = {};
  loads.forEach(load => {
    (load.load_item || []).forEach(item => {
      const code = item.stone_code;
      if (!inMap[code]) {
        inMap[code] = { 
          in_pcs: 0, 
          in_weight: 0,
          lot_no: item.lot_no,
          stone: item.stone,
          shape: item.shape,
          size: item.size,
          color: item.color,
          cutting: item.cutting,
          quality: item.quality,
          clarity: item.clarity,
          doc_date: load.doc_date,
          due_date: load.due_date
        };
      }
      inMap[code].in_pcs += item.pcs || 0;
      inMap[code].in_weight += parseFloat(item.weight) || 0;
    });
  });

  const sales = await Sale.find({}, { items: 1 }).lean();
  const outMap = {};
  sales.forEach(sale => {
    (sale.items || [])
      .filter(item => item.type !== 'Cons.')
      .forEach(item => {
        const code = item.stone_code;
        if (!outMap[code]) {
          outMap[code] = { 
            out_pcs: 0, 
            out_weight: 0,
            lot_no: item.lot_no,
            stone: item.stone,
            shape: item.shape,
            size: item.size,
            color: item.color,
            cutting: item.cutting,
            quality: item.quality,
            clarity: item.clarity,
            doc_date: sale.doc_date,
            due_date: sale.due_date
          };
        }
        outMap[code].out_pcs += item.pcs || 0;
        outMap[code].out_weight += parseFloat(item.weight) || 0;
      });
  });

  const allCodes = Array.from(new Set([...Object.keys(inMap), ...Object.keys(outMap)]));
  const result = allCodes.map(code => ({
    stone_code: code,
    lot_no: inMap[code]?.lot_no || outMap[code]?.lot_no || "",
    stone: inMap[code]?.stone || outMap[code]?.stone || "",
    shape: inMap[code]?.shape || outMap[code]?.shape || "",
    size: inMap[code]?.size || outMap[code]?.size || "",
    color: inMap[code]?.color || outMap[code]?.color || "",
    cutting: inMap[code]?.cutting || outMap[code]?.cutting || "",
    quality: inMap[code]?.quality || outMap[code]?.quality || "",
    clarity: inMap[code]?.clarity || outMap[code]?.clarity || "",
    doc_date: inMap[code]?.doc_date || outMap[code]?.doc_date || null,
    due_date: inMap[code]?.due_date || outMap[code]?.due_date || null,
    in_pcs: inMap[code]?.in_pcs || 0,
    in_weight: inMap[code]?.in_weight || 0,
    out_pcs: outMap[code]?.out_pcs || 0,
    out_weight: outMap[code]?.out_weight || 0,
    balance_pcs: (inMap[code]?.in_pcs || 0) - (outMap[code]?.out_pcs || 0),
    balance_weight: (inMap[code]?.in_weight || 0) - (outMap[code]?.out_weight || 0)
  }));

  result.sort((a, b) => a.stone_code.localeCompare(b.stone_code));

  return result;
};

exports.getStockMovementsByStoneCode = async (stoneCode) => {

  const loads = await Load.find({ "load_item.stone_code": stoneCode }).lean();

  const sales = await Sale.find({ "items.stone_code": stoneCode }).lean();

  function toFixed2(num) {
    return Number((num || 0).toFixed(2));
  }

  let movements = [];

  // =============== IN ===============
  loads.forEach(load => {
    (load.load_item || [])
      .filter(item => item.stone_code === stoneCode)
      .forEach(item => {
        movements.push({
          type: "IN",
          stock_id: item.stock_id,
          doc_date: load.doc_date,
          ref: load.invoice_no || "",
          account: load.account,
          in_pcs: item.pcs || 0,
          in_weight: parseFloat(item.weight) || 0,
          in_price: parseFloat(item.stock_price) || 0,
          in_amount: toFixed2((parseFloat(item.stock_price) || 0) * (item.pcs || 0)),
          out_pcs: 0,
          out_weight: 0,
          out_price: 0,
          out_amount: 0,
          cost_of_sale: 0,
          profit: 0,
          balance_pcs: 0,
          balance_weight: 0,
          stock_cost_amount: 0,
          stock_cost_price: 0,
          stock_value_price: 0,
          stock_value_amount: 0
        });
      });
  });

  // =============== OUT ===============
  sales.forEach(sale => {
    (sale.items || [])
      .filter(item => item.stone_code === stoneCode && item.type !== "Cons.")
      .forEach(item => {
        movements.push({
          type: "OUT",
          stock_id: item.stock_id,
          doc_date: sale.doc_date,
          ref: sale.invoice_no || "",
          account: sale.account,
          in_pcs: 0,
          in_weight: 0,
          in_price: 0,
          in_amount: 0,
          out_pcs: item.pcs || 0,
          out_weight: parseFloat(item.weight) || 0,
          out_price: parseFloat(item.price) || 0,
          out_amount: toFixed2((parseFloat(item.price) || 0) * (item.pcs || 0)),
          cost_of_sale: 0,
          profit: 0,
          balance_pcs: 0,
          balance_weight: 0,
          stock_cost_amount: 0,
          stock_cost_price: 0,
          stock_value_price: 0,
          stock_value_amount: 0
        });
      });
  });

  movements.sort((a, b) => {
    const da = new Date(a.doc_date);
    const db = new Date(b.doc_date);
    if (da - db === 0) {
      return a.type === "IN" ? -1 : 1;
    }
    return da - db;
  });

  let inv_qty = 0;
  let inv_cost = 0;
  let inv_weight = 0;

  let prev_stock_value_amount = 0;
  let prev_cost_of_sale = 0;

  movements.forEach(row => {
    if (row.type === "IN") {
      inv_cost += row.in_amount;
      inv_qty += row.in_pcs;
      inv_weight += row.in_weight;
    } else if (row.type === "OUT") {
      const avg_cost = inv_qty > 0 ? inv_cost / inv_qty : 0;
      row.cost_of_sale = toFixed2(row.out_pcs * avg_cost);
      row.profit = toFixed2(row.out_amount - row.cost_of_sale);

      inv_cost -= row.cost_of_sale;
      inv_qty -= row.out_pcs;
      inv_weight -= row.out_weight;
    }

    row.balance_pcs = inv_qty;
    row.balance_weight = toFixed2(inv_weight);
    row.stock_cost_amount = toFixed2(inv_cost);
    row.stock_cost_price = inv_qty > 0 ? toFixed2(inv_cost / inv_qty) : 0;

    const calc_value_amount =
      prev_stock_value_amount + row.in_amount - row.out_amount - prev_cost_of_sale;

    row.stock_value_amount = calc_value_amount <= 0 ? 0 : toFixed2(calc_value_amount);
    row.stock_value_price =
      row.balance_pcs > 0 ? toFixed2(row.stock_value_amount / row.balance_pcs) : 0;

    prev_stock_value_amount = row.stock_value_amount;
    prev_cost_of_sale = row.cost_of_sale;
  });

  const stock_cost_amount_total = toFixed2(
    movements.reduce((sum, r) => sum + (r.type === "IN" ? r.in_amount : 0), 0)
  );
  const stock_value_amount_total =
    movements.length > 0
      ? toFixed2(movements[movements.length - 1].stock_value_amount)
      : 0;
  const profit_total = toFixed2(
    movements.reduce((sum, r) => sum + (r.profit || 0), 0)
  );

  return {
    movements,
    stock_cost_amount_total,
    stock_value_amount_total,
    profit: profit_total
  };
};