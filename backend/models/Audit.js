const mongoose = require('mongoose');

const auditSchema = new mongoose.Schema({
  storeName: {
    type: String,
    required: true
  },
  location: {
    lat: Number,
    lng: Number
  },
  branding: {
    type: String,
    enum: ['Yes', 'No'],
    required: true
  },
  cleanliness: {
    type: String,
    enum: ['Good', 'Average', 'Poor'],
    required: true
  },
  competitor: {
    type: String,
    enum: ['Yes', 'No'],
    required: true
  },
  issue: {
    type: String,
    enum: ['Yes', 'No']
  },
  remarks: String,
  images: [String],
  status: {
    type: String,
    enum: ['draft', 'submitted'],
    default: 'draft'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, { timestamps: true });

module.exports = mongoose.model('Audit', auditSchema);
