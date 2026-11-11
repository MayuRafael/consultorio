const express = require('express');
const rateLimit = require('express-rate-limit');

const authController = require('../controllers/authController');
const validate = require('../middlewares/validate');
const isAuth = require('../middlewares/isAuth');
const { registerSchema, loginSchema } = require('../validators/authValidator');

const router = express.Router();

// Limite de tentativas de login: 5 a cada 1 minuto por IP (defesa contra força bruta)
const loginLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { erro: 'Muitas tentativas de login. Tente novamente em 1 minuto.' },
});

router.post('/register', validate(registerSchema), authController.register);
router.post('/login', loginLimiter, validate(loginSchema), authController.login);
router.post('/logout', authController.logout);
router.get('/me', isAuth, authController.me);

module.exports = router;
