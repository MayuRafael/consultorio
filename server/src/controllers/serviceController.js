const mongoose = require('mongoose');
const Service = require('../models/Service');
const Appointment = require('../models/Appointment');

function idValido(id) {
  return mongoose.isValidObjectId(id);
}

exports.list = async (req, res, next) => {
  try {
    const servicos = await Service.find().sort({ name: 1 });
    return res.status(200).json(servicos);
  } catch (err) {
    next(err);
  }
};

exports.getOne = async (req, res, next) => {
  try {
    if (!idValido(req.params.id)) return res.status(404).json({ erro: 'Serviço não encontrado' });

    const servico = await Service.findById(req.params.id);
    if (!servico) return res.status(404).json({ erro: 'Serviço não encontrado' });
    return res.status(200).json(servico);
  } catch (err) {
    next(err);
  }
};

exports.create = async (req, res, next) => {
  try {
    const servico = await Service.create(req.body);
    return res.status(201).json(servico);
  } catch (err) {
    next(err);
  }
};

exports.update = async (req, res, next) => {
  try {
    if (!idValido(req.params.id)) return res.status(404).json({ erro: 'Serviço não encontrado' });

    const servico = await Service.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!servico) return res.status(404).json({ erro: 'Serviço não encontrado' });
    return res.status(200).json(servico);
  } catch (err) {
    next(err);
  }
};

exports.remove = async (req, res, next) => {
  try {
    if (!idValido(req.params.id)) return res.status(404).json({ erro: 'Serviço não encontrado' });

    // Não apaga serviço que ainda tem agendamentos ativos
    const temAgendamentos = await Appointment.exists({ service: req.params.id, status: 'agendado' });
    if (temAgendamentos) {
      return res.status(409).json({ erro: 'Serviço possui agendamentos ativos e não pode ser removido' });
    }

    const servico = await Service.findByIdAndDelete(req.params.id);
    if (!servico) return res.status(404).json({ erro: 'Serviço não encontrado' });
    return res.status(200).json({ mensagem: 'Serviço removido' });
  } catch (err) {
    next(err);
  }
};
