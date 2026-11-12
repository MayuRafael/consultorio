const express = require('express');
const appointmentController = require('../controllers/appointmentController');
const validate = require('../middlewares/validate');
const isAuth = require('../middlewares/isAuth');
const hasRole = require('../middlewares/hasRole');
const { appointmentSchema, appointmentUpdateSchema } = require('../validators/appointmentValidator');

const router = express.Router();

// Todas as rotas exigem login
router.use(isAuth);

// Qualquer usuário logado: agenda, lista os próprios (Admin vê todos) e cancela
router.post('/', validate(appointmentSchema), appointmentController.create);
router.get('/', appointmentController.list);
router.get('/ocupados', appointmentController.ocupados);
router.get('/:id', appointmentController.getOne);
router.patch('/:id/cancelar', appointmentController.cancel);

// Somente Admin: altera e remove
router.put('/:id', hasRole('Admin'), validate(appointmentUpdateSchema), appointmentController.update);
router.delete('/:id', hasRole('Admin'), appointmentController.remove);

module.exports = router;
