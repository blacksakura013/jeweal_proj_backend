const mongoose = require('../../database'); 

const Schema =  mongoose.Schema;

// For Invoice Address
const invoiceAddressSchema = new Schema({
  address: { type: String, required: true },
  company_name: {
    type: String,
    required: true
  },
  tax_id: {
    type: String,
    required: true
  },
  country: {
    code: { type: String, required: true },
    label: { type: String, required: true }
  },
  city: {
    code: { type: String, required: true },
    label: { type: String, required: true }
  },
  state: {
    code: { type: String, required: true },
    label: { type: String, required: true }
  },
  postcode: { type: String, required: true },

   account_status: {
        type : String,
        enum:["active","inactive","delete"],
        default:"active"
    }

}, { _id: false });



const shippingAddressSchema = new Schema({
  address: { type: String },
  country: {
    code: { type: String},
    label: { type: String}
  },
  city: {
    code: { type: String},
    label: { type: String}
  },
  state: {
    code: { type: String },
    label: { type: String }
  },
  postcode: { type: String}, 
  
   account_status: {
        type : String,
        enum:["active","inactive","delete"],
        default:"active"
    }
}, { _id: false });



  const accountSchema = new Schema({
    business_type	: {
      type: String,
      enum:["corporation","personal"],
      required: true
    },
    vendor_code_id		: {
      type: String,
      required: true
    },
    vendor_code_name	: {
      type: String,
      required: true
    },
 
    currency: {
        type: String,
        required: true
      },
      contact_person: {
        type: String,
        required: true
      },
      phone_no: {
        type: String,
        required: true
      },
      email: {
        type: String,
        required: true
      },
      invoice_address: {
        type: [invoiceAddressSchema],
        required: true
      },
      shipping_address: {
        type: [shippingAddressSchema],
        required: true
      },
      account_type: {
        type : String,
        enum:["vendor","customer","associated"],
        default:"active"
    },
    account_status: {
        type : String,
        enum:["active","inactive","delete"],
        default:"active"
    }
    
  }, {
    versionKey: false
  });




  module.exports = mongoose.model('accounts', accountSchema);
  