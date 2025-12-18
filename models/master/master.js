const mongoose = require('../../database'); 
/* master type
master_stone_name
master_stone_group
master_stone_shape
master_stone_color
master_stone_size
master_stone_cutting
master_stone_quality
master_stone_clarity
master_certificate_type
master_labour_type
*/


const Schema =  mongoose.Schema;

const masterInfoSchema =  new Schema({
    stone_group: {
      type: String,
      default: ""
    },
    hsn: {
      type: String
    },
    price_pcs: {
      type: Number// Use Decimal128 for better precision with prices
    },
    price_cts: {
      type: Number // Use Decimal128 for better precision with prices
    },
    master_shapes: [],
    mm_size: {
      type: Number
    },
    carat_size: {
      type: Number
    },
    price_type: {
      type: String,
      enum: ["on_issue_weight", "on_recieve_weight"]
    },
    size_ids: [String]
  });
  
  // Define the schema for the master collection
  const masterSchema = new Schema({
    code: {
      type: String,
      required: true
    },
    name: {
      type: String,
      required: true
    },
    master_info: masterInfoSchema,
    master_type: {
        type: String,
        enum : ['master_account_storage','master_account_customer','master_account_vendor','master_item','master_item_collection','master_item_size','master_base_metal','master_metal','master_stone_group','master_stone_name','master_stone_shape','master_stone_color','master_stone_clarity','master_stone_cutting','master_stone_quality','master_stone_size','master_certificate_type','master_labour_pricing','master_labour_type',"not_defined"],
        default: 'not_defined'
    },
    master_status: {
        type : String,
        enum:["active","inactive","delete"],
        default:"active"
    },
    
  }, {
    versionKey: false
  });








  // Create the model
  masterSchema.index({master_type:1,master_status:1})
  module.exports = mongoose.model('Master', masterSchema);
  