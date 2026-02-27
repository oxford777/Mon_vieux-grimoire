const Book = require('../models/Book');

exports.createBook = (req, res) => {
  const book = new Book({
    ...req.body,
    userId: req.auth.userId, /* propriétaire = user du token */
    ratings: [],
    averageRating: 0,
  });

  book.save()
    .then(() => res.status(201).json({ message: 'Livre créé !' }))
    .catch((error) => res.status(400).json({ error }));
};

exports.getAllBooks = (req, res) => {
  Book.find()
    .then((books) => res.status(200).json(books))
    .catch((error) => res.status(400).json({ error }));
};

exports.getBestRatingBooks = (req, res) => {
  Book.find()
    .sort({ averageRating: -1 })
    .limit(3)
    .then((books) => res.status(200).json(books))
    .catch((error) => res.status(400).json({ error }));
};

exports.getOneBook = (req, res) => {
  Book.findOne({ _id: req.params.id })
    .then((book) => {
      if (!book) {
        return res.status(404).json({ message: 'Livre non trouvé !' });
      }
      return res.status(200).json(book);
    })
    .catch((error) => res.status(400).json({ error }));
};

exports.updateBook = (req, res) => {
  Book.findOne({ _id: req.params.id }) 
  .then((book) => {
      if (!book) {
        return res.status(404).json({ message: 'Livre non trouvé !' });
      }

      if (book.userId !== req.auth.userId) {
        return res.status(403).json({ message: 'unauthorized request' });
      }

      return Book.updateOne(
        { _id: req.params.id },
        { ...req.body, _id: req.params.id }
      );
    })
    .then((result) => {
      if (!result) return; /* au cas où on a déjà répondu (404/403) */
      res.status(200).json({ message: 'Livre modifié !' });
    })
    .catch((error) => res.status(400).json({ error }));
};

exports.deleteBook = (req, res) => {
  Book.findOne({ _id: req.params.id })
    .then((book) => {
      if (!book) {
        return res.status(404).json({ message: 'Livre non trouvé !' });
      }

      if (book.userId !== req.auth.userId) {
        return res.status(403).json({ message: 'unauthorized request' });
      }

      return Book.deleteOne({ _id: req.params.id });
    })
    .then((result) => {
      if (!result) return;
      res.status(200).json({ message: 'Livre supprimé !' });
    })
    .catch((error) => res.status(400).json({ error }));
};

exports.rateBook = (req, res) => {
  const { userId, rating } = req.body;

  /* userId du body doit correspondre au user authentifié */
  if (userId !== req.auth.userId) {
    return res.status(403).json({ message: 'unauthorized request' });
  }

  const grade = Number(rating);

  if (Number.isNaN(grade) || grade < 0 || grade > 5) {
    return res.status(400).json({ message: 'La note doit être comprise entre 0 et 5' });
  }

  Book.findOne({ _id: req.params.id })
    .then((book) => {
      if (!book) {
        return res.status(404).json({ message: 'Livre non trouvé !' });
      }

      const alreadyRated = book.ratings.some((r) => r.userId === userId);
      if (alreadyRated) {
        return res.status(400).json({ message: 'Vous avez déjà noté ce livre' });
      }

      book.ratings.push({ userId, grade });

      // recalcul moyenne
      const sum = book.ratings.reduce((acc, r) => acc + r.grade, 0);
      book.averageRating = sum / book.ratings.length;

      return book.save();
    })
    .then((savedBook) => {
      if (!savedBook) return;
      res.status(200).json(savedBook);
    })
    .catch((error) => res.status(400).json({ error }));
};
