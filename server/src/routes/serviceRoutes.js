const express = require('express');
const serviceController = require('../controllers/serviceController');
const validate = require('../middlewares/validate');
const isAuth = require('../middlewares/isAuth');
const hasRole = require('../middlewares/hasRole');
const { serviceSchema, serviceUpdateSchema } = require('../validators/serviceValidator');

const router = express.Router();

// Todas as rotas exigem login
router.use(isAuth);

// Leitura: qualquer usuário logado (o paciente precisa ver os serviços para agendar)
router.get('/', serviceController.list);
router.get('/:id', serviceController.getOne);

// Escrita: somente Admin
router.post('/', hasRole('Admin'), validate(serviceSchema), serviceController.create);
router.put('/:id', hasRole('Admin'), validate(serviceUpdateSchema), serviceController.update);
router.delete('/:id', hasRole('Admin'), serviceController.remove);

module.exports = router;
