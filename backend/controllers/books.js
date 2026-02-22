const Book = require('../models/Book');

exports.createBook = (req, res) => {
  const book = new Book({
    ...req.body,
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
  Book.updateOne({ _id: req.params.id }, { ...req.body, _id: req.params.id })
    .then(() => res.status(200).json({ message: 'Livre modifié !' }))
    .catch((error) => res.status(400).json({ error }));
};

exports.deleteBook = (req, res) => {
  Book.deleteOne({ _id: req.params.id })
    .then(() => res.status(200).json({ message: 'Livre supprimé !' }))
    .catch((error) => res.status(400).json({ error }));
};
