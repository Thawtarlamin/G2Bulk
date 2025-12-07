const mongoose = require('mongoose');

const appConfigSchema = new mongoose.Schema({
  ad_text: {
    type: String,
    default: ''
  },
  view_pager: [{
    image: {
      type: String,
      required: true
    }
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('AppConfig', appConfigSchema);
