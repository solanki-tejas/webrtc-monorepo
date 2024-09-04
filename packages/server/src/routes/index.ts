import express from 'express';
// import logger from '../utils/logger';
import { healthCheck } from '../handlers/healthCheck';

const router = express.Router();

/* GET home page. */
router.get('/', healthCheck);

export default router;
