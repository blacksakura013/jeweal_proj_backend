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
            invoice_no: { $regex: `^PO${currentYear}${currentMonth}` } 
        })
            .sort({ invoice_no: -1 }) 
            .select('invoice_no'); 

        let nextInvoiceNo;

        if (lastQuotation && lastQuotation.invoice_no) {

            const lastNumber = parseInt(lastQuotation.invoice_no.slice(-3), 10); 
            nextInvoiceNo = `PO${currentYear}${currentMonth}${(lastNumber + 1).toString().padStart(3, '0')}`; 
        } else {

            nextInvoiceNo = `PO${currentYear}${currentMonth}001`;
        }

        return nextInvoiceNo;
    } catch (error) {
        throw new Error('Failed to generate next invoice number: ' + error.message);
    }
};