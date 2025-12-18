const inventoryItemValidateSchema = {  
  type: 'object',
  properties: {
    location: { type: 'string' },
    stone: { type: 'string' },
    shape: { type: 'string' },
    size: { type: 'string' },
    color: { type: 'string' },
    cutting: { type: 'string' },
    quality: { type: 'string' },
    clarity: { type: 'string' },
    cer_type: { type: 'string' },
    cer_no: { type: 'string' },
    lot_no: { 
      type: 'string',
      minLength: 1 
    },
    pcs: { type: 'number' }, 
    weight: { type: 'number' }, 
    total_amount: { type: 'number' },
    price: { type: 'number' },
    discount_percent: { type: 'number' },
    discount_amount: { type: 'number' },
    vat_value:{ type:'number' },
    vat:{type:'boolean'},
    unit: { 
      type: 'string',
      enum: ["pcs", "cts"]
    },
    amount: { type: 'number' }, 
    pcs: { type: 'number' }, 
    labour_price: { type: 'number' }, 
    labour_unit: { type: 'string' }, 
    unit_price: { type: 'string' }, 
    labour_type: { type: 'string' }, 
    due_date: { type: 'string', format: 'date-time' },
    ref_no: { type: 'string' },
    remark: { type: 'string' },
    status: { 
      type: 'string',
      enum: ["active", "inactive", "deleted"]
    },
  },
  required: ['lot_no' ], 
  additionalProperties: false 
};

const inventoryInSchema = {
  type: 'object',
  properties: {

    account: { 
      type: 'string',
      minLength: 1 
    },
    inventory_item: {
      type: 'array',
      items: inventoryItemValidateSchema
    },
    
    inventory_type: { 
      type: 'string',
      enum: ["memo_in", "purchase_po", "purchase_pu"]
    },
    doc_date: { type: 'string', format: 'date-time' },
    currency: { 
      type: 'string',
      minLength: 1 
        },
    exchange_rate: { type: 'string' },
    due_date: { type: 'string', format: 'date-time' },
    ref_1: { type: 'string' },
    ref_2: { type: 'string' },
    remark: { type: 'string' },
    note: { type: 'string' }
  },
  required: [ 'account', 'currency','exchange_rate','due_date','doc_date'], 
  additionalProperties: true 
}
  
  
  exports.validateSchema = {
    body: inventoryInSchema
  }
  