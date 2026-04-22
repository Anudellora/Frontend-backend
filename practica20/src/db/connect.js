const mongoose = require('mongoose');

async function connect() {
  const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/practica20';
  await mongoose.connect(uri);
  console.log('Connected to MongoDB:', uri);
}

module.exports = connect;
