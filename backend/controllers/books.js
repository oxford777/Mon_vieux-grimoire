const Book = require('../models/Book');
const fs = require('fs');
const sharp = require('sharp');
const path = require('path');

exports.createBook = (req, res) => {
  const bookObject = JSON.parse(req.body.book);

  delete bookObject._id;
  delete bookObject.userId;

  const originalFilename = req.file.filename;
  const originalPath = path.join('images', originalFilename);

  const optimizedFilename = originalFilename.split('.')[0] + '.webp';
  const optimizedPath = path.join('images', optimizedFilename);

  sharp(originalPath)
    .resize({ width: 800 })
    .webp({ quality: 80 })
    .toFile(optimizedPath)
    .then(() => {
      fs.unlink(originalPath, () => {}); /* supprime l'image non optimisée */


const book = new Book({
  ...bookObject,
  userId: req.auth.userId,
  imageUrl: `${req.protocol}://${req.get('host')}/images/${optimizedFilename}`,
  ratings: [],
  averageRating:0
});

    return book.save();
  })
    .then(() => res.status(201).json({ message: 'Livre créé !' }))
    .catch(error => res.status(400).json({ error }));
};

exports.getAllBooks = (_req, res) => {
  Book.find()
    .then((books) => res.status(200).json(books))
    .catch((error) => res.status(400).json({ error }));
};

exports.getBestRatingBooks = (_req, res) => {
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
        return res.status(404).end();
      }
      return res.status(200).json(book);
    })
    .catch((error) => res.status(400).json({ error }));
};

exports.updateBook = (req, res) => {
  const bookObject = req.file ? 
      JSON.parse(req.body.book)
    : { ...req.body };

  /* Sécurité : le client ne doit pas choisir le propriétaire */
  delete bookObject.userId;
  delete bookObject._id;

  Book.findOne({ _id: req.params.id }) 
  .then((book) => {
      if (!book) {
        return res.status(404).end();
      }

      if (book.userId !== req.auth.userId) {
        return res.status(403).json({ message: '403: unauthorized request' });
      }

      /* CAS 1 : PAS de nouvelle image */
      if (!req.file) {
      return Book.updateOne(
        { _id: req.params.id },
        { ...bookObject, _id: req.params.id }
      );
    }

    /* CAS 2 : Nouvelle image avec optimisation Sharp */
      const originalFilename = req.file.filename;
      const originalPath = path.join('images', originalFilename);

      const optimizedFilename = originalFilename.split('.')[0] + '.webp';
      const optimizedPath = path.join('images', optimizedFilename);

      return sharp(originalPath)
        .resize({ width: 800 })
        .webp({ quality: 80 })
        .toFile(optimizedPath)
        .then(() => {
          /* supprimer image uploadée non optimisée */
          fs.unlink(originalPath, () => {});

          /* supprimer ancienne image */
          const oldFilename = book.imageUrl.split('/images/')[1];
          fs.unlink(path.join('images', oldFilename), () => {});

          return Book.updateOne(
            { _id: req.params.id },
            {
              ...bookObject,
              imageUrl: `${req.protocol}://${req.get('host')}/images/${optimizedFilename}`,
              _id: req.params.id
            }
          );
        });
    })

    .then(() => {
      res.status(200).json({ message: 'Livre modifié !' });
    })
    .catch((error) => { res.status(400).json({ error });
  });
};

exports.deleteBook = (req, res) => {
  Book.findOne({ _id: req.params.id })
    .then((book) => {
      if (!book) {
        return res.status(404).end();
      }

      if (book.userId !== req.auth.userId) {
        return res.status(403).json({ message: '403: unauthorized request' });
      }

      const filename = book.imageUrl.split('/images/')[1];
      const imagePath = path.join('images', filename);

    fs.unlink(imagePath, () => {
      Book.deleteOne({ _id: req.params.id })
        .then(() => {
          res.status(200).json({ message: 'Livre supprimé !' });
        })
        .catch((error) => res.status(400).json({ error }));
    });
})
    .catch((error) => {
      res.status(500).json({ error });
    });
};

exports.rateBook = (req, res) => {
  const { userId, rating } = req.body;

  /* userId du body doit correspondre au user authentifié */
  if (userId !== req.auth.userId) {
    return res.status(403).json({ message: '403: unauthorized request' });
  }

  const grade = Number(rating);

  if (Number.isNaN(grade) || grade < 0 || grade > 5) {
    return res.status(400).end();
  }

  Book.findOne({ _id: req.params.id })
    .then((book) => {
      if (!book) {
        return res.status(404).end();
      }

      const alreadyRated = book.ratings.some((r) => r.userId === userId);
      if (alreadyRated) {
        return res.status(400).end();
      }

      book.ratings.push({ userId, grade });

      /* calcul moyenne de notes */
      const sum = book.ratings.reduce((acc, r) => acc + r.grade, 0);
      book.averageRating = Math.round((sum / book.ratings.length) * 10) / 10;

      return book.save();
    })
    .then((savedBook) => {
      if (!savedBook) return;
      res.status(200).json(savedBook);
    })
    .catch((error) => res.status(400).json({ error }));
};
