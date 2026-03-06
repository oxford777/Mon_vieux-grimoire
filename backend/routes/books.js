const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const multer = require('../middleware/multer-config');

const booksCtrl = require('../controllers/books');


/* routes publiques (selon specs : GET non requis) */
router.get('/', booksCtrl.getAllBooks);
router.get('/bestrating', booksCtrl.getBestRatingBooks);
router.get('/:id', booksCtrl.getOneBook);

/* routes protégées (selon specs : Requis) */
router.post('/', auth, multer, booksCtrl.createBook);
router.put('/:id', auth,multer, booksCtrl.updateBook);
router.delete('/:id', auth, booksCtrl.deleteBook);
router.post('/:id/rating', auth, booksCtrl.rateBook); /* IMPORTANT: selon specs */

module.exports = router;
