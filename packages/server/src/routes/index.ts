import express from 'express';
// import logger from '../utils/logger';
import { healthCheck } from '../handlers/healthCheck';
import authRoutes from './auth';

const router = express.Router();

/* GET home page. */
router.get('/', healthCheck);
router.use('/auth', authRoutes);

export default router;
