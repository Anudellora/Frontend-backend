const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, '..', 'database.json');

const bcrypt = require('bcryptjs');

// Default database structure
const defaultData = {
  users: [],
  products: [],
  nextUserId: 1,
  nextProductId: 1
};

// Seed data with demo user and sample products
const seedData = {
  users: [
    {
      id: 1,
      email: 'demo@test.com',
      first_name: 'Demo',
      last_name: 'User',
      password: bcrypt.hashSync('demo1234', 10)
    }
  ],
  products: [
    { id: 1, title: 'Ноутбук ASUS VivoBook', category: 'Электроника', description: 'Мощный ноутбук для работы и учёбы, 16 ГБ ОЗУ, SSD 512 ГБ', price: 54990 },
    { id: 2, title: 'Смартфон Samsung Galaxy', category: 'Электроника', description: 'Флагманский смартфон с камерой 108 МП и AMOLED экраном', price: 39990 },
    { id: 3, title: 'Кроссовки Nike Air Max', category: 'Одежда', description: 'Стильные кроссовки для повседневной носки, размеры 40-45', price: 8990 }
  ],
  nextUserId: 2,
  nextProductId: 4
};

// Load database from file
function loadDB() {
  try {
    if (fs.existsSync(DB_PATH)) {
      const raw = fs.readFileSync(DB_PATH, 'utf-8');
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Ошибка чтения базы данных, создаём новую:', e.message);
  }
  return JSON.parse(JSON.stringify(seedData));
}

// Save database to file
function saveDB(data) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
}

// Initialize DB file if it doesn't exist
if (!fs.existsSync(DB_PATH)) {
  saveDB(seedData);
}

module.exports = { loadDB, saveDB };
