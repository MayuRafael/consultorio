const mongoose = require('mongoose');

// Tipo de atendimento oferecido pelo consultório (ex.: consulta de rotina, retorno)
const serviceSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    description: { type: String, trim: true, maxlength: 500, default: '' },
    durationMinutes: { type: Number, required: true, min: 5, max: 480 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Service', serviceSchema);
