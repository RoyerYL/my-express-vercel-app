const router = require('express').Router();
const ctrl = require('../controllers/articulos.controller');

router.get('/',     ctrl.listar);
router.get('/:id',  ctrl.obtener);
router.patch('/:id', ctrl.actualizar);

module.exports = router;