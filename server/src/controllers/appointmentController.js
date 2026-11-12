const mongoose = require('mongoose');
const Appointment = require('../models/Appointment');
const Service = require('../models/Service');

const CONFLITO = 'Este horário já está ocupado. Escolha outro.';

function idValido(id) {
  return mongoose.isValidObjectId(id);
}

// Admin vê todos os agendamentos; Paciente vê só os próprios
function filtroDeAcesso(req) {
  return req.session.role === 'Admin' ? {} : { patient: req.session.userId };
}

exports.create = async (req, res, next) => {
  try {
    const { serviceId, date } = req.body;

    const servico = await Service.findById(serviceId);
    if (!servico) return res.status(404).json({ erro: 'Serviço não encontrado' });

    // Checagem antes de salvar, para responder com mensagem clara
    const ocupado = await Appointment.exists({ date, status: 'agendado' });
    if (ocupado) return res.status(409).json({ erro: CONFLITO });

    const agendamento = await Appointment.create({
      patient: req.session.userId,
      service: serviceId,
      date,
    });

    return res.status(201).json(agendamento);
  } catch (err) {
    // Trata corrida: dois pacientes tentando o mesmo horário ao mesmo tempo
    if (err.code === 11000) return res.status(409).json({ erro: CONFLITO });
    next(err);
  }
};

exports.list = async (req, res, next) => {
  try {
    const agendamentos = await Appointment.find(filtroDeAcesso(req))
      .populate('service', 'name durationMinutes')
      .populate('patient', 'name email')
      .sort({ date: 1 });
    return res.status(200).json(agendamentos);
  } catch (err) {
    next(err);
  }
};

exports.getOne = async (req, res, next) => {
  try {
    if (!idValido(req.params.id)) return res.status(404).json({ erro: 'Agendamento não encontrado' });

    // Filtra também pelo acesso: paciente não consegue ver agendamento de outro
    const agendamento = await Appointment.findOne({ _id: req.params.id, ...filtroDeAcesso(req) })
      .populate('service', 'name durationMinutes')
      .populate('patient', 'name email');
    if (!agendamento) return res.status(404).json({ erro: 'Agendamento não encontrado' });
    return res.status(200).json(agendamento);
  } catch (err) {
    next(err);
  }
};

// Paciente (ou Admin) cancela um agendamento. O registro é mantido com status "cancelado".
exports.cancel = async (req, res, next) => {
  try {
    if (!idValido(req.params.id)) return res.status(404).json({ erro: 'Agendamento não encontrado' });

    const agendamento = await Appointment.findOne({ _id: req.params.id, ...filtroDeAcesso(req) });
    if (!agendamento) return res.status(404).json({ erro: 'Agendamento não encontrado' });

    if (agendamento.status === 'cancelado') {
      return res.status(409).json({ erro: 'Este agendamento já está cancelado' });
    }

    agendamento.status = 'cancelado';
    await agendamento.save();
    return res.status(200).json({ mensagem: 'Agendamento cancelado', agendamento });
  } catch (err) {
    next(err);
  }
};

// Somente Admin: altera serviço, horário ou status
exports.update = async (req, res, next) => {
  try {
    if (!idValido(req.params.id)) return res.status(404).json({ erro: 'Agendamento não encontrado' });

    const { serviceId, ...resto } = req.body;
    const alteracoes = { ...resto };

    if (serviceId) {
      const servico = await Service.findById(serviceId);
      if (!servico) return res.status(404).json({ erro: 'Serviço não encontrado' });
      alteracoes.service = serviceId;
    }

    if (alteracoes.date) {
      const ocupado = await Appointment.exists({
        date: alteracoes.date,
        status: 'agendado',
        _id: { $ne: req.params.id },
      });
      if (ocupado) return res.status(409).json({ erro: CONFLITO });
    }

    const agendamento = await Appointment.findByIdAndUpdate(req.params.id, alteracoes, {
      new: true,
      runValidators: true,
    });
    if (!agendamento) return res.status(404).json({ erro: 'Agendamento não encontrado' });
    return res.status(200).json(agendamento);
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ erro: CONFLITO });
    next(err);
  }
};

// Somente Admin: remove o registro
exports.remove = async (req, res, next) => {
  try {
    if (!idValido(req.params.id)) return res.status(404).json({ erro: 'Agendamento não encontrado' });

    const agendamento = await Appointment.findByIdAndDelete(req.params.id);
    if (!agendamento) return res.status(404).json({ erro: 'Agendamento não encontrado' });
    return res.status(200).json({ mensagem: 'Agendamento removido' });
  } catch (err) {
    next(err);
  }
};

// Horários ocupados em um período. Não expõe nomes de pacientes: só as datas.
exports.ocupados = async (req, res, next) => {
  try {
    const { ocupadosQuerySchema } = require('../validators/appointmentValidator');
    const { error, value } = ocupadosQuerySchema.validate(req.query, { stripUnknown: true });
    if (error) {
      return res.status(400).json({ erro: 'Período inválido', detalhes: error.details.map((d) => d.message) });
    }

    const agendamentos = await Appointment.find({
      status: 'agendado',
      date: { $gte: value.inicio, $lt: value.fim },
    })
      .select('date -_id')
      .sort({ date: 1 });

    return res.status(200).json(agendamentos.map((a) => a.date.toISOString()));
  } catch (err) {
    next(err);
  }
};
