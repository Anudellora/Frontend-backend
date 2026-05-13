import { db } from './db.js';
import { GraphQLError } from 'graphql';

export const resolvers = {
  // ── Query ────────────────────────────────────────────────
  Query: {
    books: () => db.books,

    book: (_, { id }) => {
      const book = db.books.find(b => b.id === id);
      if (!book) throw new GraphQLError(`Книга с id ${id} не найдена`, {
        extensions: { code: 'NOT_FOUND' },
      });
      return book;
    },

    authors: () => db.authors,

    author: (_, { id }) => {
      const author = db.authors.find(a => a.id === id);
      if (!author) throw new GraphQLError(`Автор с id ${id} не найден`, {
        extensions: { code: 'NOT_FOUND' },
      });
      return author;
    },
  },

  // ── Mutation ─────────────────────────────────────────────
  Mutation: {
    createAuthor: (_, { name, bio }) => {
      if (!name.trim()) throw new GraphQLError('Имя автора не может быть пустым', {
        extensions: { code: 'BAD_USER_INPUT' },
      });

      const author = { id: String(db.nextAuthorId++), name: name.trim(), bio: bio ?? null };
      db.authors.push(author);
      return author;
    },

    createBook: (_, { title, year, genre, authorId }) => {
      if (!title.trim()) throw new GraphQLError('Название книги не может быть пустым', {
        extensions: { code: 'BAD_USER_INPUT' },
      });

      const authorExists = db.authors.some(a => a.id === authorId);
      if (!authorExists) throw new GraphQLError(`Автор с id ${authorId} не найден`, {
        extensions: { code: 'NOT_FOUND' },
      });

      const book = {
        id:       String(db.nextBookId++),
        title:    title.trim(),
        year,
        genre:    genre ?? null,
        authorId,
      };
      db.books.push(book);
      return book;
    },

    deleteBook: (_, { id }) => {
      const index = db.books.findIndex(b => b.id === id);
      if (index === -1) throw new GraphQLError(`Книга с id ${id} не найдена`, {
        extensions: { code: 'NOT_FOUND' },
      });
      db.books.splice(index, 1);
      return true;
    },
  },

  // ── Вложенные резолверы ──────────────────────────────────
  Book: {
    // Book хранит authorId → резолвер находит объект Author
    author: (book) => db.authors.find(a => a.id === book.authorId),
  },

  Author: {
    // Author не хранит список книг → резолвер фильтрует по authorId
    books: (author) => db.books.filter(b => b.authorId === author.id),
  },
};
