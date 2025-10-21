//
import { RequestHandler, Router } from 'express';

// 
import UserController from '../controller/user-controller';
import jwtAuth from '../../../modules/middleware/auth/jwtAuth';

const router = Router();

router.post('/api/user/auth', UserController.login);
router.get('/api/user/refresh-token', UserController.refreshToken)
router.post('/api/user/auth/login-2fa', UserController.login2FA);
// Rota para buscar usuário por email
router.use(jwtAuth as RequestHandler);
router.get('/api/user/logout', UserController.logout);
router.get('/api/user/email/:email', UserController.findByEmail);

export default router;
