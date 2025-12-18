const saleService = require('../services/saleService')
const fs = require('fs');
const path = require('path');

exports.createSale = async (req, reply) => {
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
        } catch (e) {
          console.warn("Invalid summary JSON format");
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

    const saleData = {
      ...formData,
      items,
    };

    await saleService.checkStockAvailability(saleData.items);
    const savedSale = await saleService.createSale(saleData);

    reply.code(201).send(savedSale);
  } catch (error) {
    console.error(error);
    reply.code(500).send({ message: 'Failed to create sale', error: error.message });
  }
};


exports.getSaleById = async (request, reply) => {
  try {
    const sale = await saleService.getSaleById(request.params.id);
    reply.code(200).send(sale);
  } catch (error) {
    reply.code(404).send({ message: error.message });
  }
};

exports.getAllSales = async (request, reply) => {
  try {
    const sales = await saleService.getAllSales();
    reply.code(200).send(sales);
  } catch (error) {
    reply.code(500).send({ message: 'Failed to fetch sales', error: error.message });
  }
};

exports.getNextInvoiceNo = async (req, reply) => {
  try {
      const nextInvoiceNo = await saleService.getNextInvoiceNo();
      reply.code(200).send({ next_invoice_no: nextInvoiceNo });
  } catch (error) {
      reply.code(500).send({ error: error.message });
  }
};

exports.updateSale = async (req, reply) => {
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

          const m = String(part.fieldname || "").match(/^image_(.+)$/);
          const token = m ? m[1] : null;

          const uniqueName = `${Date.now()}-${part.filename}`;
          const uploadDir = path.join(__dirname, "..", "uploads");
          await fs.promises.mkdir(uploadDir, { recursive: true });
          const uploadPath = path.join(uploadDir, uniqueName);
          await fs.promises.writeFile(uploadPath, buffer);

          if (token) imageFilesMap[token] = `/uploads/${uniqueName}`;
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
          return { ...item, image: uploadedPath ?? item.image ?? null };
        });
      }

    } else {
      formData = req.body || {};
      items = Array.isArray(formData.items) ? formData.items : [];
    }

    if (formData.summary) {
      if (typeof formData.summary === "string") {
        try {
          formData.summary = JSON.parse(formData.summary);
        } catch {
          return reply.code(400).send({ error: "Invalid JSON format in summary" });
        }
      }
    }

    updateData = { ...formData, items };

    const updatedSale = await saleService.updateSale(req.params.id, updateData);
    if (!updatedSale)
      return reply.code(404).send({ message: "Sale not found" });

    reply.send({ message: "Sale updated successfully", updatedSale });
  } catch (error) {
    reply.code(500).send({ error: error.message });
  }
};

exports.cancelSale = async (request, reply) => {
  try {
    const result = await saleService.cancelSale(request.params.id);
    reply.code(200).send({ message: 'Sale cancelled and return rows created', result });
  } catch (error) {
    reply.code(400).send({ error: error.message });
  }
};