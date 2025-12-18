const fs = require('fs');
const path = require('path');
const memoOutService = require('../services/memoOutService');

exports.createMemoOut = async (req, reply) => {
  try {
    let formData = {};
    let items = [];

    if (req.isMultipart && req.isMultipart()) {
      const parts = req.parts();
      const imageFilesMap = {}; // token -> '/uploads/...'

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

      // parse summary if needed
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
    }

    const data = { ...formData, items };
    const memoOut = await memoOutService.createMemoOut(data);
    reply.code(201).send(memoOut);
  } catch (error) {
    console.error(error);
    reply.code(500).send({ error: error.message });
  }
};

exports.updateMemoOut = async (req, reply) => {
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
          console.warn("Invalid summary JSON in updateMemoOut");
        }
      }

      if (formData.doc_date) formData.doc_date = new Date(formData.doc_date);
      if (formData.due_date) formData.due_date = new Date(formData.due_date);

      updateData = { ...formData, items };
    } else {
      updateData = req.body || {};
      if (Array.isArray(updateData.items)) {
        updateData.items = updateData.items.map((item) => ({
          ...item,
          image: item.image || null,
        }));
      }
    }

    const updated = await memoOutService.updateMemoOut(req.params.id, updateData);
    reply.send(updated);
  } catch (error) {
    console.error(error);
    reply.code(500).send({ error: error.message });
  }
};

exports.getNextInvoiceNo = async (req, reply) => {
    try {
        const invoiceNo = await memoOutService.getNextInvoiceNo();
        reply.send({ invoice_no: invoiceNo });
    } catch (error) {
        reply.code(400).send({ error: error.message });
    }
};

exports.getAllMemoOuts = async (req, reply) => {
    try {
        const memoOuts = await memoOutService.getAllMemoOuts();
        reply.send(memoOuts);
    } catch (error) {
        reply.code(400).send({ error: error.message });
    }
};

exports.getMemoOutById = async (req, reply) => {
    try {
        const memoOut = await memoOutService.getMemoOutById(req.params.id);
        reply.send(memoOut);
    } catch (error) {
        reply.code(400).send({ error: error.message });
    }
};

exports.getAllMemoOutItems = async (req, reply) => {
    try {
        const items = await memoOutService.getAllMemoOutItems(req.query);
        reply.send(items);
    } catch (error) {
        reply.code(400).send({ error: error.message });
    }
};