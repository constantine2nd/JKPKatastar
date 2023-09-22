import express from 'express';
import { saveGrave, getGraves, getSingleGrave } from '../controllers/gravesController.js'

const router = express.Router();

router.route('/').get(getGraves);
router.route('/:id').get(getSingleGrave);
router.route('/').post(saveGrave);

export default router;