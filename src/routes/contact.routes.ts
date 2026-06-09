import express from 'express';
import ContactController from '../controller/contact.controller';

const router = express.Router();

router.get('/info', ContactController.getInfo);
router.post('/', ContactController.submitMessage);

export default router;
