import express from 'express';
import { getLoginHistory } from '../controllers/loginController.js';

const router = express.Router();



router.get('/login-history', getLoginHistory);


export default router;
