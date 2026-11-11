const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema(
  {
    patient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    service: { type: mongoose.Schema.Types.ObjectId, ref: 'Service', required: true },
    date: { type: Date, required: true },
    status: { type: String, enum: ['agendado', 'cancelado'], default: 'agendado' },
  },
  { timestamps: true }
);

// Regra de negócio: a clínica não pode ter dois agendamentos ativos no mesmo horário.
// O índice parcial só vale para status "agendado", então horários cancelados ficam livres.
appointmentSchema.index(
  { date: 1 },
  { unique: true, partialFilterExpression: { status: 'agendado' } }
);

module.exports = mongoose.model('Appointment', appointmentSchema);
