const fs = require('fs');
const path = require('path');
const puService = require("../services/puService");

exports.createPU = async (req, reply) => {
  try {
    let formData = {};
    let items = [];

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

      // Parse items and summary
      if (formData.items) {
        try {
          items = JSON.parse(formData.items);
        } catch {
          return reply.code(400).send({ error: "Invalid JSON format in items" });
        }

        // Merge uploaded file paths back to items:
        // - Prefer match by item._id
        // - Fall back to numeric index if no _id or no file for _id
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

      // Clean header dates (front-end sends actual Date or ISO strings; guard either way)
      if (formData.doc_date) {
        formData.doc_date = new Date(formData.doc_date);
      }
      if (formData.due_date) {
        formData.due_date = new Date(formData.due_date);
      }
    } else {
      // Non-multipart (no new files) – keep behavior as-is
      formData = req.body || {};
      items = Array.isArray(formData.items) ? formData.items : [];
    }

    const data = { ...formData, items };

    const newPU = await puService.createPU(data);
    reply.code(201).send(newPU);
  } catch (error) {
    console.error(error);
    reply.code(500).send({ error: error.message });
  }
};

exports.getAllPUs = async (req, reply) => {
    try {
        const pos = await puService.getAllPUs();
        reply.code(200).send(pos);
    } catch (error) {
        reply.code(500).send({ error: error.message });
    }
};

exports.getPUById = async (req, reply) => {
    try {
        const po = await puService.getPUById(req.params.id);
        if (!po) return reply.code(404).send({ message: "PU not found" });
        reply.code(200).send(po);
    } catch (error) {
        reply.code(500).send({ error: error.message });
    }
};

exports.updatePU = async (req, reply) => {
  try {
    let updateData = {};
    let formData = {};
    let imageFiles = [];
    let items = [];

    if (req.isMultipart && req.isMultipart()) {
      const parts = req.parts();

      for await (const part of parts) {
        if (part.file) {
          const buffer = await part.toBuffer();
          if (buffer.length > 500 * 1024) {
            return reply.code(400).send({ error: "Image file size must not exceed 500KB" });
          }
          const uniqueName = `${Date.now()}-${part.filename}`;
          const uploadDir = path.join(__dirname, '..', 'uploads');
          await fs.promises.mkdir(uploadDir, { recursive: true });
          const uploadPath = path.join(uploadDir, uniqueName);
          await fs.promises.writeFile(uploadPath, buffer);
          imageFiles.push(`/uploads/${uniqueName}`);
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

        items = items.map((item, index) => ({
          ...item,
          image: imageFiles[index] || item.image || null,
        }));
      }
      if (formData.summary) {
        try {
          formData.summary = JSON.parse(formData.summary);
        } catch {
          console.warn("Invalid summary JSON in updatePU");
        }
      }

      updateData = {
        ...formData,
        items,
      };

    } else {
      updateData = req.body;
      if (Array.isArray(updateData.items)) {
        updateData.items = updateData.items.map((item) => ({
          ...item,
          image: item.image || null,
        }));
      }
    }
    const updatedPU = await puService.updatePU(req.params.id, updateData);

    if (!updatedPU)
      return reply.code(404).send({ message: "PU not found" });

    reply.code(200).send(updatedPU);

  } catch (error) {
    console.error(error);
    reply.code(500).send({ error: error.message });
  }
}

exports.getNextInvoiceNo = async (req, reply) => {
    try {
        const nextInvoiceNo = await puService.getNextInvoiceNo();
        reply.code(200).send({ next_invoice_no: nextInvoiceNo });
    } catch (error) {
        reply.code(500).send({ error: error.message });
    }
};

exports.getPUByInvoiceNo = async (req, reply) => {
    try {
        const { invoice_no } = req.params;
        const po = await puService.getPUByInvoiceNo(invoice_no);
        reply.code(200).send(po);
    } catch (error) {
        reply.code(404).send({ message: error.message });
    }
};

exports.getAllApprovePUItemsByAccount = async (req, reply) => {
  try {
    const { account } = req.query;
    const items = await puService.getAllApprovePUItemsByAccount(account);
    reply.code(200).send(items);
  } catch (error) {
    reply.code(500).send({ error: error.message });
  }
};

exports.approvePU = async (req, reply) => {
  try {
    const updatedPU = await puService.updatePU(req.params.id, { status: "approved" });
    if (!updatedPU) return reply.code(404).send({ message: "PU not found" });
    reply.code(200).send({
      status: updatedPU.status,
      invoice_no: updatedPU.invoice_no
    });
  } catch (error) {
    reply.code(500).send({ error: error.message });
  }
};