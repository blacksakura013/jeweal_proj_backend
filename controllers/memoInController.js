const fs = require("fs");
const path = require("path");
const memoInService = require("../services/memoInService");

exports.createMemoIn = async (req, reply) => {
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
    const memoIn = await memoInService.createMemoIn(data);

    reply.code(201).send({ message: "Memo In created successfully", memoIn });
  } catch (error) {
    console.error(error);
    reply.code(500).send({ error: error.message });
  }
};


exports.getAllMemoIns = async (request, reply) => {
  try {
    const { account } = request.query;
    const memoIns = await memoInService.getAllMemoIns({ account });
    reply.code(200).send(memoIns);
  } catch (error) {
    reply.code(500).send({ error: error.message });
  }
};

exports.getMemoInById = async (request, reply) => {
  try {
    const memoIn = await memoInService.getMemoInById(request.params.id);
    if (!memoIn) return reply.code(404).send({ message: "Memo In not found" });
    reply.send(memoIn);
  } catch (error) {
    reply.code(500).send({ error: error.message });
  }
};

exports.updateMemoIn = async (req, reply) => {
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

      // ADD THIS: Parse summary from JSON string
      if (formData.summary) {
        try {
          formData.summary = JSON.parse(formData.summary);
        } catch {
          return reply.code(400).send({ error: "Invalid JSON format in summary" });
        }
      }

      updateData = { ...formData, items };
    } else {
      updateData = req.body;
    }

    const updatedMemoIn = await memoInService.updateMemoIn(req.params.id, updateData);
    if (!updatedMemoIn) return reply.code(404).send({ message: "Memo In not found" });

    reply.send({ message: "Memo In updated successfully", updatedMemoIn });
  } catch (error) {
    console.error(error);
    reply.code(500).send({ error: error.message });
  }
};

exports.getNextInvoiceNo = async (req, reply) => {
  try {
      const nextInvoiceNo = await memoInService.getNextInvoiceNo();
      reply.code(200).send({ next_invoice_no: nextInvoiceNo });
  } catch (error) {
      reply.code(500).send({ error: error.message });
  }
};

exports.getAllMemoInsItems = async (request) => {
  const { account } = request.query;
  const memoIns = await memoInService.getAllMemoIns({ account });
  const decimalFields = [
    "weight",
    "price",
    "amount",
    "other_price",
    "discount_percent",
    "discount_amount",
    "total_amount"
  ];

  const filterData = Array.isArray(memoIns)
    ? memoIns.flatMap((memo) => {
        if (!memo || !Array.isArray(memo.items)) return [];

        return memo.items
          .filter((item) => item)
          .map((item) => {
            const cleanedItem = {
              ...item.toObject({ getters: true }),
              invoice_no: memo.invoice_no ?? null,
              doc_date: memo.doc_date ?? null,
              due_date: memo.due_date ?? null,
            };
            for (const field of decimalFields) {
              const val = cleanedItem[field];
              if (val && typeof val === "object" && "$numberDecimal" in val) {
                cleanedItem[field] = parseFloat(val.$numberDecimal);
              }
            }

            return cleanedItem;
          });
      })
    : [];
  return filterData;
};
exports.approveMemoIn = async (req,reply) => {
  try{
    const memoIn = await memoInService.approveMemoIn(req.params.id);
    reply.code(200).send({ message: "Memo In approved successfully",memoIn});
  }catch(error){
    reply.code(500).send({ error: error.message});
  }
};