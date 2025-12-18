const fs = require('fs');
const path = require('path');
const reserveService = require('../services/reserveService');

exports.createReserve = async (req, reply) => {
  try {
    let formData = {};
    let items = [];
    const imageFilesMap = {};

    if (req.isMultipart && req.isMultipart()) {
      const parts = req.parts();

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
          return { ...item, image: uploadedPath ?? item.image ?? null };
        });
      }

      // ADD THIS: Parse summary from JSON string
      if (formData.summary) {
        try {
          formData.summary = JSON.parse(formData.summary);
        } catch {
          return reply.code(400).send({ error: "Invalid JSON format in summary" });
        }
      }

      if (formData.doc_date) formData.doc_date = new Date(formData.doc_date);
      if (formData.due_date) formData.due_date = new Date(formData.due_date);
    } else {
      formData = req.body || {};
      items = Array.isArray(formData.items) ? formData.items : [];
    }

    const data = { ...formData, items };
    const reserve = await reserveService.createReserve(data);

    reply.code(201).send({ message: 'Reserve created successfully', reserve });
  } catch (error) {
    console.error(error);
    reply.code(500).send({ error: error.message });
  }
};

exports.updateReserve = async (req, reply) => {
  try {
    let updateData = {};
    let formData = {};
    let items = [];
    const imageFilesMap = {};

    if (req.isMultipart && req.isMultipart()) {
      const parts = req.parts();

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
          return { ...item, image: uploadedPath ?? item.image ?? null };
        });
      }

  
      if (formData.summary) {
        try {
          formData.summary = JSON.parse(formData.summary);
        } catch {
          return reply.code(400).send({ error: "Invalid JSON format in summary" });
        }
      }

      if (formData.doc_date) formData.doc_date = new Date(formData.doc_date);
      if (formData.due_date) formData.due_date = new Date(formData.due_date);

      updateData = { ...formData, items };
    } else {
      updateData = req.body || {};
      if (Array.isArray(updateData.items)) {
        updateData.items = updateData.items.map(i => ({ ...i, image: i.image || null }));
      }
    }

    const updatedReserve = await reserveService.updateReserve(req.params.id, updateData);
    if (!updatedReserve) return reply.code(404).send({ message: 'Reserve not found' });

    reply.code(200).send({ message: 'Reserve updated successfully', updatedReserve });
  } catch (error) {
    console.error(error);
    reply.code(500).send({ error: error.message });
  }
};

exports.getNextInvoiceNo = async (req, reply) => {
    try {
        const nextInvoiceNo = await reserveService.getNextInvoiceNo();
        reply.code(200).send({ next_invoice_no: nextInvoiceNo });
    } catch (error) {
        reply.code(500).send({ error: error.message });
    }
};

exports.getAllReserves = async (req, reply) => {
    try {
        const reserves = await reserveService.getAllReserves();
        reply.code(200).send(reserves);
    } catch (error) {
        reply.code(500).send({ error: error.message });
    }
};

exports.getReserveById = async (req, reply) => {
    try {
        const reserve = await reserveService.getReserveById(req.params.id);
        if (!reserve) return reply.code(404).send({ message: 'Reserve not found' });
        reply.code(200).send(reserve);
    } catch (error) {
        reply.code(500).send({ error: error.message });
    }
};

exports.getAllReturnReservesByAccount = async (req, reply) => {
    try {
        const { account } = req.query;
        const reserves = await reserveService.getAllReturnReservesByAccount(account);
        reply.code(200).send(reserves);
    } catch (error) {
        reply.code(500).send({ error: error.message });
    }
};

exports.approveReserve = async (req, reply) => {
  try {
    const reserve = await reserveService.approveReserve(req.params.id);
    reply.code(200).send({ message: 'Reserve approved successfully', reserve });
  } catch (error) {
    reply.code(400).send({ error: error.message });
  }
};