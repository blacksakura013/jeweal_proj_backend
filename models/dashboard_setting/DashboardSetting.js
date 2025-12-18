const mongoose = require('../../database');
const { Schema } = mongoose;

const DashboardSettingSchema = new Schema({
  columnClass: { type: String, required: true },
  index: { type: Number, required: true },
  name: { type: String, required: true }
});

const DashboardSchema = new Schema(
  {
    user_id: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
    dashboard_setting: { type: [DashboardSettingSchema], required: true },
    type: { type: String, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Shortcut', DashboardSchema);

