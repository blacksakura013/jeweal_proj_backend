const fs = require('fs');
const path = require('path');
const loadService = require('../services/loadService');

exports.createLoad = async (req, reply) => {
  try {
    let formData = {};
    let loadItems = [];

    if (req.isMultipart && req.isMultipart()) {
      const parts = req.parts();
      const imageFilesMap = {}; // image_<index> or image_<id> → '/uploads/...'

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

      if (formData.load_item) {
        try {
          loadItems = JSON.parse(formData.load_item);
        } catch {
          return reply.code(400).send({ error: "Invalid JSON format in load_item" });
        }

        loadItems = loadItems.map((item, index) => {
          const keyById = item && item._id ? String(item._id) : undefined;
          const keyByIndex = String(index);
          const uploadedPath =
            (keyById && imageFilesMap[keyById]) ?? imageFilesMap[keyByIndex];
          return {
            ...item,
            image: uploadedPath ?? item.image ?? null,
          };
        });
      }

      if (formData.pu_item) {
        try {
          formData.pu_item = JSON.parse(formData.pu_item);
        } catch {
          console.warn("Invalid pu_item JSON");
        }
      }

      if (formData.doc_date) formData.doc_date = new Date(formData.doc_date);
      if (formData.due_date) formData.due_date = new Date(formData.due_date);

    } else {
      formData = req.body || {};
      loadItems = Array.isArray(formData.load_item) ? formData.load_item : [];
    }

    const data = { ...formData, load_item: loadItems };
    const load = await loadService.createLoad(data);

    reply.code(201).send({ message: "Load created successfully", load });

  } catch (error) {
    console.error("createLoad error:", error);
    reply.code(500).send({ error: error.message });
  }
};

exports.getAllLoads = async (req, reply) => {
    try {
        const { account } = req.query;
        const loads = await loadService.getAllLoads({ account });
        reply.code(200).send(loads);
    } catch (error) {
        reply.code(500).send({ error: error.message });
    }
};

exports.getLoadById = async (req, reply) => {
    try {
        const load = await loadService.getLoadById(req.params.id);
        if (!load) return reply.code(404).send({ message: "Load not found" });
        reply.send(load);
    } catch (error) {
        reply.code(500).send({ error: error.message });
    }
};

exports.updateLoad = async (req, reply) => {
  try {
    let updateData = {};
    let formData = {};
    let loadItems = [];

    if (req.isMultipart && req.isMultipart()) {
      const parts = req.parts();
      const imageFilesMap = {}; // token -> '/uploads/..' where token is _id or index (string)

      for await (const part of parts) {
        if (part.file) {
          const buffer = await part.toBuffer();
          if (buffer.length > 500 * 1024) {
            return reply.code(400).send({ error: "Image file size must not exceed 500KB" });
          }

          // Expect field names like: image_<_id> OR image_<index>
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

      if (formData.load_item) {
        try {
          loadItems = JSON.parse(formData.load_item);
        } catch {
          return reply.code(400).send({ error: "Invalid JSON format in load_item" });
        }

        // Merge uploaded file paths back to items
        loadItems = loadItems.map((item, index) => {
          const keyById = item && item._id ? String(item._id) : undefined;
          const keyByIndex = String(index);
          const uploadedPath = (keyById && imageFilesMap[keyById]) ?? imageFilesMap[keyByIndex];

          return {
            ...item,
            image: uploadedPath ?? item.image ?? null,
          };
        });
      }

      if (formData.pu_item) {
        try {
          formData.pu_item = JSON.parse(formData.pu_item);
        } catch {
          console.warn("Invalid pu_item JSON in updateLoad");
        }
      }

      if (formData.doc_date) formData.doc_date = new Date(formData.doc_date);
      if (formData.due_date) formData.due_date = new Date(formData.due_date);

      updateData = { ...formData, load_item: loadItems };
    } else {
      updateData = req.body || {};
      loadItems = Array.isArray(updateData.load_item) ? updateData.load_item : [];
      updateData.load_item = loadItems;
    }

    const updatedLoad = await loadService.updateLoad(req.params.id, updateData);
    if (!updatedLoad) return reply.code(404).send({ message: "Load not found" });

    reply.send({ message: "Load updated successfully", updatedLoad });
  } catch (error) {
    console.error("updateLoad error:", error);
    reply.code(500).send({ error: error.message });
  }
};



exports.approveLoad = async (req, reply) => {
    try {
        const load = await loadService.approveLoad(req.params.id);
        reply.code(200).send({ message: "Load approved successfully", load });
    } catch (error) {
        reply.code(500).send({ error: error.message });
    }
};

exports.getNextInvoiceNo = async (req, reply) => {
    try {
        const nextInvoiceNo = await loadService.getNextInvoiceNo();
        reply.code(200).send({ next_invoice_no: nextInvoiceNo });
    } catch (error) {
        reply.code(500).send({ error: error.message });
    }
};

    