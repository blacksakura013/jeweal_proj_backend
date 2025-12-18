const Quotation = require("../models/quotation/quotation");
const { generateQuotationInvoiceNo } = require('../helpers/invoiceHelper');

exports.createQuotation = async (data) => {
    const countData = await Quotation.countDocuments();
    const invoiceNo = generateQuotationInvoiceNo(countData, 3);
    const newQuotation = new Quotation({ ...data, invoice_no: invoiceNo });
    return await newQuotation.save();
};

exports.getAllQuotations = async () => {
    return await Quotation.find().populate("account");
};

exports.getQuotationById = async (id) => {
    return await Quotation.findById(id).populate("account");
};
exports.getAllQuotations = async () => {
    return await Quotation.find().populate("currency").populate("account"); 
};

exports.getQuotationById = async (id) => {
    return await Quotation.findById(id).populate("currency").populate("account"); 
};

exports.updateQuotation = async (id, data) => {
    return await Quotation.findByIdAndUpdate(id, data, { new: true });
};

exports.getNextInvoiceNo = async () => {
    try {
        const currentYear = new Date().getFullYear().toString().slice(-2); 
        const currentMonth = (new Date().getMonth() + 1).toString().padStart(2, '0'); 
        const lastQuotation = await Quotation.findOne({
            invoice_no: { $regex: `^QT${currentYear}${currentMonth}` } 
        })
            .sort({ invoice_no: -1 }) 
            .select('invoice_no'); 

        let nextInvoiceNo;

        if (lastQuotation && lastQuotation.invoice_no) {

            const lastNumber = parseInt(lastQuotation.invoice_no.slice(-3), 10); 
            nextInvoiceNo = `QT${currentYear}${currentMonth}${(lastNumber + 1).toString().padStart(3, '0')}`; 
        } else {

            nextInvoiceNo = `QT${currentYear}${currentMonth}001`;
        }

        return nextInvoiceNo;
    } catch (error) {
        throw new Error('Failed to generate next invoice number: ' + error.message);
    }
};
  exports.getQuotationByInvoiceNo = async (invoiceNo) => {
    try {
        const quotation = await Quotation.findOne({ invoice_no: invoiceNo }).populate("account");
        if (!quotation) {
            throw new Error("Quotation not found");
        }
        return quotation;
    } catch (error) {
        throw new Error("Failed to fetch quotation: " + error.message);
    }
};