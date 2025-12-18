const mongoose = require('../../database');

const Schema = mongoose.Schema;

const customerAccountSchema = new Schema({
  business_type: {
    type: String,
    enum: ["corporation", "personal"],
    required: true
  },
  customer_id: {
    type: String,
    required: true
  },
  customer_code_name: {
    type: String,
    required: true
  },
   country: {
      code: String,
      label: String
  },
  city: {
      code: String,
      label: String
  },
   state: {
      code: String,
      label: String
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
  customer_invoice_address_list: {
    type: {},
    required: true
  },
  tax_id:{
      type: String,
      required: true
  },
  customer_shipping_address_list: {
    type: {},
    required: true
  },
  account_type: {
    type: String,
    enum: ["vendor", "customer", "associated"],
    default: "active"
  },
  account_status: {
    type: String,
    enum: ["active", "inactive", "delete"],
    default: "active"
  }

}, {
  versionKey: false
});








// Create the model
//   accountSchema.index({account_status:1,id_number:1,_id:1})
module.exports = mongoose.model('customerAccount', customerAccountSchema);
