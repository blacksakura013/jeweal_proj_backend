const mongoose = require('../../database'); 
const companyProfileInSchema = new mongoose.Schema({
  website: String,
  currency: String,
  address: String,
  image_logo_url: String,
  country: {
      code: String,
      label: String
  },
  city: {
      code: String,
      label: String
  },
  postcode: String,
  email: String,
  phone: String,
  company_name: String,
  contact_person: String,
  mailing_name: String,
  official_address: String,
  state_province: {
      code: String,
      label: String
  },
  tax_id: String
}, { strict: false });

  module.exports = mongoose.model('company_profile', companyProfileInSchema);
  