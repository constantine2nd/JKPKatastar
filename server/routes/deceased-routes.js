import express from 'express';
import { saveDeacesed } from '../controllers/deceasedController.js'

const router = express.Router();


router.route('/:id').post(saveDeacesed);

export default router;