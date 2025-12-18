const inventoryPUModel = require("../models/inventory/InventoryIn");
const { generatePUInvoiceNo } = require('../helpers/invoiceHelper');
const Master = require('../models/master/master');

// In your PU creation service
exports.createPU = async (data) => {
    console.log(data, "data>>")
    console.log("hello")
    const countData = await inventoryPUModel.countDocuments({ inventory_type: "purchase_pu" });
    const invoiceNo = generatePUInvoiceNo(countData, 3);
    
    // Add original data fields when creating PU items
    const itemsWithOriginalData = data.items.map(item => ({
        ...item,
        // Store original data (same as current data when first created)
        original_pcs: item.pcs,        // 200 PCS (original)
       
    }));
    
    const newPU = new inventoryPUModel({ 
      
        ...data, 
        items: itemsWithOriginalData,
        invoice_no: invoiceNo 
    });
    console.log(newPU, "pu>>>")
    return await newPU.save();
};

// Get all POs
exports.getAllPUs = async () => {
    return await inventoryPUModel.find({ inventory_type: "purchase_pu" }).populate("currency").populate("account").populate("vendor_code_id");
};

// Get PO by ID
exports.getPUById = async (id) => {
    return await inventoryPUModel.findById(id).populate("currency").populate("account").populate("vendor_code_id");
};

// Update PO
exports.updatePU = async (id, data) => {
  return await inventoryPUModel.findOneAndUpdate(
    { _id: id, inventory_type: "purchase_pu" },
    data,
    { new: true }
  );
};


// Generate next PO invoice number
const invoiceHelp = require("../helpers/invoiceHelper.js")
const InventoryIn = require("../models/inventory/InventoryIn");
const inventoryInModel = require("../models/inventory/InventoryIn.js")
const InventoryInPipeline = require("../models/inventory/InventoryInPipeLine.js");

const getPrefix = (inventory_type) => {
    switch(inventory_type){
        case "memo_in" :
            return "MI"
        break;

        case "purchase_po":
            return "PO"
        break;

        case "purchase_pu":
            return "PU"

        break;

        default:
        return "";
    }
}
exports.createInventoryIn = async (payload) => {
    const countInvoiceNumber = await countInvoice(payload.inventory_type);
    const invoiceNumber = invoiceHelp.generateInvoiceNo(getPrefix(payload.inventory_type), countInvoiceNumber);
  
    let data = payload;
    data.invoice_no = invoiceNumber; 
    await inventoryInModel.create(data); 
    return data;
  };

exports.updateInventoryIn = async (_id,payloadData)=>{

    return inventoryInModel.findOneAndUpdate({_id:_id},payloadData,{new:true})
}

exports.getInventoryList = async (inventory_type)=>{
    // const inventoryInData = inventoryInModel.find({inventory_type:inventory_type});  
    const pipeline = InventoryInPipeline.InventoryInListPipeline(inventory_type); 
     const inventoryInData = inventoryInModel.aggregate(pipeline); 
    
    return inventoryInData;
}


const countInvoice = async (type)=> { 
// สร้างโมเดล
    return await inventoryInModel.countDocuments({inventory_type:type});

}

exports.getInvoiceNo = async (inventory_type)=>{
    
    const countInvoiceNumber = await countInvoice(inventory_type);
    const invoiceNumber = invoiceHelp.generateInvoiceNo(getPrefix(inventory_type) , countInvoiceNumber )
    return invoiceNumber;
}



exports.getNextInvoiceNo = async () => {
    try {
        const currentYear = new Date().getFullYear().toString().slice(-2); 
        const currentMonth = (new Date().getMonth() + 1).toString().padStart(2, '0'); 
        const lastQuotation = await InventoryIn.findOne({
            inventory_type: "purchase_pu",
            invoice_no: { $regex: `^PU${currentYear}${currentMonth}` } 
        })
            .sort({ invoice_no: -1 }) 
            .select('invoice_no'); 

        let nextInvoiceNo;

        if (lastQuotation && lastQuotation.invoice_no) {

            const lastNumber = parseInt(lastQuotation.invoice_no.slice(-3), 10); 
            nextInvoiceNo = `PU${currentYear}${currentMonth}${(lastNumber + 1).toString().padStart(3, '0')}`; 
        } else {

            nextInvoiceNo = `PU${currentYear}${currentMonth}001`;
        }

        return nextInvoiceNo;
    } catch (error) {
        throw new Error('Failed to generate next invoice number: ' + error.message);
    }
};
// Get PO by invoice number
exports.getPUByInvoiceNo = async (invoiceNo) => {
    try {
        const po = await inventoryPUModel.findOne({ invoice_no: invoiceNo }).populate("account");
        if (!po) {
            throw new Error("PU not found");
        }
        return po;
    } catch (error) {
        throw new Error("Failed to fetch PU: " + error.message);
    }
};

exports.getAllApprovePUItemsByAccount = async (account) => {
  const pus = await inventoryPUModel.find({
    inventory_type: "purchase_pu",
    status: "approved",
    account: account
  })
    .populate("currency")
    .populate("account")
    .populate("vendor_code_id")
    .lean();

  function convertDecimalFields(obj) {
    const result = {};
    for (const key in obj) {
      if (
        obj[key] &&
        typeof obj[key] === 'object' &&
        obj[key]._bsontype === 'Decimal128'
      ) {
        result[key] = parseFloat(obj[key].toString());
      } else {
        result[key] = obj[key];
      }
    }
    return result;
  }

  const allItemsRaw = pus.flatMap(pu =>
    (pu.items || [])
      .filter(item => (item.pcs || 0) > 0)
      .map(item => ({
        ...convertDecimalFields(item),
        pu_id: pu._id,
        invoice_no: pu.invoice_no,
        doc_date: pu.doc_date,
        account: pu.account,
        vendor_code_id: pu.vendor_code_id,
        currency: pu.currency,
        status: pu.status
      }))
  );
  const allStoneMasters = await Master.find({ master_type: "master_stone_name" }).lean();
  const allShapeMasters = await Master.find({ master_type: "master_stone_shape" }).lean();
  const allSizeMasters = await Master.find({ master_type: "master_stone_size" }).lean();
  const allColorMasters = await Master.find({ master_type: "master_stone_color" }).lean();
  const allQualityMasters = await Master.find({ master_type: "master_stone_quality" }).lean();
  const allClarityMasters = await Master.find({ master_type: "master_stone_clarity" }).lean();

  const stoneNameToMaster = Object.fromEntries(allStoneMasters.map(m => [m.name, m]));
  const shapeNameToMaster = Object.fromEntries(allShapeMasters.map(m => [m.name, m]));
  const sizeNameToMaster = Object.fromEntries(allSizeMasters.map(m => [m.name, m]));
  const colorNameToMaster = Object.fromEntries(allColorMasters.map(m => [m.name, m]));
  const qualityNameToMaster = Object.fromEntries(allQualityMasters.map(m => [m.name, m]));
  const clarityNameToMaster = Object.fromEntries(allClarityMasters.map(m => [m.name, m]));

  const allItems = allItemsRaw.map(item => {
    // stone
    let stoneMaster = null;
    if (item.stone && stoneNameToMaster[item.stone]) {
      stoneMaster = {
        code: stoneNameToMaster[item.stone].code,
        name: stoneNameToMaster[item.stone].name
      };
    }
    // shape
    let shapeMaster = null;
    if (item.shape && shapeNameToMaster[item.shape]) {
      shapeMaster = {
        code: shapeNameToMaster[item.shape].code,
        name: shapeNameToMaster[item.shape].name
      };
    }
    // size
    let sizeMaster = null;
    if (item.size && sizeNameToMaster[item.size]) {
      sizeMaster = {
        code: sizeNameToMaster[item.size].code,
        name: sizeNameToMaster[item.size].name
      };
    }
    // color
    let colorMaster = null;
    if (item.color && colorNameToMaster[item.color]) {
      colorMaster = {
        code: colorNameToMaster[item.color].code,
        name: colorNameToMaster[item.color].name
      };
    }
    // quality
    let qualityMaster = null;
    if (item.quality && qualityNameToMaster[item.quality]) {
      qualityMaster = {
        code: qualityNameToMaster[item.quality].code,
        name: qualityNameToMaster[item.quality].name
      };
    }
    // clarity
    let clarityMaster = null;
    if (item.clarity && clarityNameToMaster[item.clarity]) {
      clarityMaster = {
        code: clarityNameToMaster[item.clarity].code,
        name: clarityNameToMaster[item.clarity].name
      };
    }

    const { _id, ...rest } = item;
    return {
      ...rest,
      pu_item_id: _id,
      stone_master: stoneMaster,
      shape_master: shapeMaster,
      size_master: sizeMaster,
      color_master: colorMaster,
      quality_master: qualityMaster,
      clarity_master: clarityMaster,
    };
  });

  return allItems;
};