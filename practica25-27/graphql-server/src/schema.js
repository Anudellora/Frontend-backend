export const typeDefs = `#graphql
  type Author {
    id: ID!
    name: String!
    bio: String
    books: [Book!]!
  }

  type Book {
    id: ID!
    title: String!
    year: Int!
    genre: String
    author: Author!
  }

  type Query {
    books: [Book!]!
    book(id: ID!): Book
    authors: [Author!]!
    author(id: ID!): Author
  }

  type Mutation {
    createAuthor(name: String!, bio: String): Author!
    createBook(title: String!, year: Int!, genre: String, authorId: ID!): Book!
    deleteBook(id: ID!): Boolean!
  }
`;
