const fs = require('fs');
const path = require('path');
const quotationService = require("../services/quotationService");

exports.createQuotation = async (req, reply) => {
    try {
        let formData = {};
        let items = [];

        if (req.isMultipart && req.isMultipart()) {
            const parts = req.parts();
            const imageFilesMap = {};

            for await (const part of parts) {
                if (part.file) {
                    const buffer = await part.toBuffer();
                    if (buffer.length > 500 * 1024) {
                        return reply.code(400).send({ error: "Image file size must not exceed 500KB" });
                    }
                    const m = String(part.fieldname || '').match(/^image_(.+)$/);
                    const token = m ? m[1] : null;
                    const uniqueName = `${Date.now()}-${part.filename}`;
                    const uploadDir = path.join(__dirname, '..', 'uploads');
                    await fs.promises.mkdir(uploadDir, { recursive: true });
                    const uploadPath = path.join(uploadDir, uniqueName);
                    await fs.promises.writeFile(uploadPath, buffer);

                    if (token) {
                        imageFilesMap[token] = `/uploads/${uniqueName}`;
                    }
                } else {
                    formData[part.fieldname] = part.value;
                }
            }

            if (formData.items) {
                try {
                    items = JSON.parse(formData.items);
                } catch {
                    return reply.code(400).send({ error: "Invalid JSON format in items" });
                }

                items = items.map((item, index) => {
                    const keyById = item && item._id ? String(item._id) : undefined;
                    const keyByIndex = String(index);
                    const uploadedPath = (keyById && imageFilesMap[keyById]) ?? imageFilesMap[keyByIndex];
                    return {
                        ...item,
                        image: uploadedPath ?? item.image ?? null,
                    };
                });
            }

            if (formData.summary) {
                try {
                    formData.summary = JSON.parse(formData.summary);
                } catch {
                    console.warn("Invalid summary JSON");
                }
            }

            if (formData.doc_date) formData.doc_date = new Date(formData.doc_date);
            if (formData.due_date) formData.due_date = new Date(formData.due_date);

        } else {
            formData = req.body || {};
            items = Array.isArray(formData.items) ? formData.items : [];

            if (typeof formData.summary === 'string') {
                try {
                    formData.summary = JSON.parse(formData.summary);
                } catch {
                    console.warn("Invalid summary JSON in JSON body");
                }
            }
        }

        const quotationData = {
            ...formData,
            items,
        };

        const newQuotation = await quotationService.createQuotation(quotationData);
        reply.code(201).send(newQuotation);
    } catch (error) {
        reply.code(500).send({ error: error.message });
    }
};

exports.getAllQuotations = async (req, reply) => {
    try {
        const quotations = await quotationService.getAllQuotations();
        reply.code(200).send(quotations);
    } catch (error) {
        reply.code(500).send({ error: error.message });
    }
};

exports.getQuotationById = async (req, reply) => {
    try {
        const quotation = await quotationService.getQuotationById(req.params.id);
        if (!quotation) return reply.code(404).send({ message: "Quotation not found" });
        reply.code(200).send(quotation);
    } catch (error) {
        reply.code(500).send({ error: error.message });
    }
};

exports.updateQuotation = async (req, reply) => {
    try {
        let updateData = {};
        let formData = {};
        let items = [];

        if (req.isMultipart && req.isMultipart()) {
            const parts = req.parts();
            const imageFilesMap = {};

            for await (const part of parts) {
                if (part.file) {
                    const buffer = await part.toBuffer();
                    if (buffer.length > 500 * 1024) {
                        return reply.code(400).send({ error: "Image file size must not exceed 500KB" });
                    }
                    const m = String(part.fieldname || '').match(/^image_(.+)$/);
                    const token = m ? m[1] : null;
                    const uniqueName = `${Date.now()}-${part.filename}`;
                    const uploadDir = path.join(__dirname, '..', 'uploads');
                    await fs.promises.mkdir(uploadDir, { recursive: true });
                    const uploadPath = path.join(uploadDir, uniqueName);
                    await fs.promises.writeFile(uploadPath, buffer);

                    if (token) {
                        imageFilesMap[token] = `/uploads/${uniqueName}`;
                    }
                } else {
                    formData[part.fieldname] = part.value;
                }
            }

            if (formData.items) {
                try {
                    items = JSON.parse(formData.items);
                } catch {
                    return reply.code(400).send({ error: "Invalid JSON format in items" });
                }

                items = items.map((item, index) => {
                    const keyById = item && item._id ? String(item._id) : undefined;
                    const keyByIndex = String(index);
                    const uploadedPath = (keyById && imageFilesMap[keyById]) ?? imageFilesMap[keyByIndex];
                    return {
                        ...item,
                        image: uploadedPath ?? item.image ?? null,
                    };
                });
            }

            if (formData.summary) {
                try {
                    formData.summary = JSON.parse(formData.summary);
                } catch {
                    console.warn("Invalid summary JSON in updateQuotation");
                }
            }

            if (formData.doc_date) formData.doc_date = new Date(formData.doc_date);
            if (formData.due_date) formData.due_date = new Date(formData.due_date);

            updateData = { ...formData, items };
        } else {
            updateData = req.body || {};
            items = Array.isArray(updateData.items) ? updateData.items : [];
            updateData.items = items;

            if (typeof updateData.summary === 'string') {
                try {
                    updateData.summary = JSON.parse(updateData.summary);
                } catch {
                    return reply.code(400).send({ error: "Invalid JSON format in summary" });
                }
            }
        }

        const updatedQuotation = await quotationService.updateQuotation(req.params.id, updateData);
        if (!updatedQuotation) return reply.code(404).send({ message: "Quotation not found" });
        reply.code(200).send(updatedQuotation);
    } catch (error) {
        reply.code(500).send({ error: error.message });
    }
};

exports.getNextInvoiceNo = async (req, reply) => {
    try {
        const nextInvoiceNo = await quotationService.getNextInvoiceNo();
        reply.code(200).send({ next_invoice_no: nextInvoiceNo });
    } catch (error) {
        reply.code(500).send({ error: error.message });
    }
};
 
  exports.getQuotationByInvoiceNo = async (req, reply) => {
    try {
        const { invoice_no } = req.params;
        const quotation = await quotationService.getQuotationByInvoiceNo(invoice_no);
        reply.code(200).send(quotation);
    } catch (error) {
        reply.code(404).send({ message: error.message });
    }
};