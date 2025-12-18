
const dateHelper = require('./dateHelper.js')

exports.generateCode = (prefix = "", yearPrefix = "", countData = 1, maxDigits = 5) => {
    const genNum = genNumber(countData, maxDigits);
    return `${prefix}${yearPrefix}${genNum}`;
};

exports.generateInvoiceNo = (prefix = "", countData = 1, maxDigits = 3) => {
    const yearMonth = dateHelper.getYearMonth();
    return exports.generateCode(prefix, yearMonth, countData, maxDigits);
};

exports.generateStockId = (countData = 1, maxDigits = 5) => {
    const yearPrefix = new Date().getFullYear().toString().slice(-2); // ปี 2 หลัก
    return exports.generateCode("", yearPrefix, countData, maxDigits); 
};
exports.generateSaleInvoiceNo = (countData = 1, maxDigits = 3) => {
    const prefix = "SA"; 
    return exports.generateInvoiceNo(prefix, countData, maxDigits);
};

exports.generateQuotationInvoiceNo = (countData = 1, maxDigits = 3) => {
    const prefix = "QT"; 
    return exports.generateInvoiceNo(prefix, countData, maxDigits);
};

exports.generateMemoInInvoiceNo = (countData = 1, maxDigits = 3) => {
    const prefix = "MI"; 
    return exports.generateInvoiceNo(prefix, countData, maxDigits);
};

exports.generateLoadInvoiceNo = (countData = 1, maxDigits = 3) => {
    const prefix = "L"; 
    return exports.generateInvoiceNo(prefix, countData, maxDigits);
};

exports.generateMemoReturnInvoiceNo = async (countData = 1, maxDigits = 3) => {
    const prefix = "MR"; 
    return exports.generateInvoiceNo(prefix, countData, maxDigits);
};





exports.generatePOInvoiceNo = (countData = 1, maxDigits = 3) => {
    const prefix = "PO"; 
    return exports.generateInvoiceNo(prefix, countData, maxDigits);
};

exports.generatePUInvoiceNo = (countData = 1, maxDigits = 3) => {
    const prefix = "PU"; 
    return exports.generateInvoiceNo(prefix, countData, maxDigits);
};

exports.generateReserveInvoiceNo = (countData = 1, maxDigits = 3) => {
    const prefix = "OD"; 
    return exports.generateInvoiceNo(prefix, countData, maxDigits);
};



exports.generateMemoOutInvoiceNo = (countData = 1, maxDigits = 3) => {
    const prefix = "MO";
    return exports.generateInvoiceNo(prefix, countData, maxDigits);
};

exports.generateMemoOutReturnInvoiceNo = (countData = 1, maxDigits = 3) => {
    const prefix = "MOR";
    return exports.generateInvoiceNo(prefix, countData, maxDigits);
};


    exports.generateNextInvoiceNo = async (prefix, model) => {
        const currentYear = new Date().getFullYear().toString().slice(-2);
        const currentMonth = (new Date().getMonth() + 1).toString().padStart(2, '0');
    
        const lastDocument = await model.findOne({
            invoice_no: { $regex: `^${prefix}${currentYear}${currentMonth}` }
        })
            .sort({ invoice_no: -1 })
            .select('invoice_no');
    
        let nextInvoiceNo;
    
        if (lastDocument && lastDocument.invoice_no) {
            const lastNumber = parseInt(lastDocument.invoice_no.slice(-3), 10);
            nextInvoiceNo = `${prefix}${currentYear}${currentMonth}${(lastNumber + 1).toString().padStart(3, '0')}`;
        } else {
    
            nextInvoiceNo = `${prefix}${currentYear}${currentMonth}001`;
        }
    
        return nextInvoiceNo;
    };


function genNumber(currentNumber, maxDigits) {
    const newNumber = currentNumber + 1; // เพิ่มลำดับเลขทีละ 1
    return newNumber.toString().padStart(maxDigits, '0'); // เติมเลข 0 นำหน้า
}