const express = require('express');
const router = express.Router();
const booksCtrl = require('../controllers/books');

router.post('/', booksCtrl.createBook);
router.get('/', booksCtrl.getAllBooks);
router.get('/:id', booksCtrl.getOneBook);
router.put('/:id', booksCtrl.updateBook);
router.delete('/:id', booksCtrl.deleteBook);

module.exports = router;
