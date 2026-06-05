const mongoose = require('mongoose');

const ComponentSchema = new mongoose.Schema({
  id: String,
  type: String, // 'db', 'server', 'lb', 'client', 'cache'
  x: Number,
  y: Number,
  label: String
});

const ConnectionSchema = new mongoose.Schema({
  id: String,
  source: String, // component id
  target: String, // component id
  label: String
});

const SystemDesignSchema = new mongoose.Schema({
  title: { type: String, required: true },
  authorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  authorName: String,
  problemDescription: String,
  components: [ComponentSchema],
  connections: [ConnectionSchema],
  likes: { type: Number, default: 0 },
  isPublic: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('SystemDesign', SystemDesignSchema);
