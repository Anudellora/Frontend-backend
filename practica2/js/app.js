const API_URL = 'http://localhost:3000/api/products';

const productForm = document.getElementById('productForm');
const productsList = document.getElementById('productsList');
const productIdInput = document.getElementById('productId');
const productNameInput = document.getElementById('productName');
const productPriceInput = document.getElementById('productPrice');
const cancelBtn = document.getElementById('cancelBtn');
const formTitle = document.querySelector('.form-section__title');

// Загрузка всех товаров
async function loadProducts() {
  try {
    const response = await fetch(API_URL);
    const result = await response.json();
    
    if (result.success) {
      renderProducts(result.data);
    }
  } catch (error) {
    console.error('Ошибка загрузки товаров:', error);
    alert('Не удалось загрузить товары. Проверьте, запущен ли сервер.');
  }
}

// Отображение товаров
function renderProducts(products) {
  if (products.length === 0) {
    productsList.innerHTML = '<p class="empty-message">Товары отсутствуют</p>';
    return;
  }

  productsList.innerHTML = products.map(product => `
    <article class="product-card">
      <div class="product-card__content">
        <h3 class="product-card__name">${product.name}</h3>
        <p class="product-card__price">${product.price.toFixed(2)} ₽</p>
      </div>
      <div class="product-card__actions">
        <button onclick="editProduct(${product.id})" class="btn btn--edit">
          Изменить
        </button>
        <button onclick="deleteProduct(${product.id})" class="btn btn--delete">
          Удалить
        </button>
      </div>
    </article>
  `).join('');
}

// Создание или обновление товара
productForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const id = productIdInput.value;
  const name = productNameInput.value.trim();
  const price = parseFloat(productPriceInput.value);
  
  const method = id ? 'PUT' : 'POST';
  const url = id ? `${API_URL}/${id}` : API_URL;
  
  try {
    const response = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, price })
    });
    
    const result = await response.json();
    
    if (result.success) {
      alert(result.message);
      resetForm();
      loadProducts();
    } else {
      alert(result.message);
    }
  } catch (error) {
    console.error('Ошибка сохранения:', error);
    alert('Не удалось сохранить товар');
  }
});

// Редактирование товара
async function editProduct(id) {
  try {
    const response = await fetch(`${API_URL}/${id}`);
    const result = await response.json();
    
    if (result.success) {
      const product = result.data;
      productIdInput.value = product.id;
      productNameInput.value = product.name;
      productPriceInput.value = product.price;
      cancelBtn.style.display = 'inline-block';
      formTitle.textContent = 'Редактировать товар';
    }
  } catch (error) {
    console.error('Ошибка загрузки товара:', error);
  }
}

// Удаление товара
async function deleteProduct(id) {
  if (!confirm('Удалить этот товар?')) return;
  
  try {
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'DELETE'
    });
    
    const result = await response.json();
    
    if (result.success) {
      alert(result.message);
      loadProducts();
    }
  } catch (error) {
    console.error('Ошибка удаления:', error);
    alert('Не удалось удалить товар');
  }
}

// Сброс формы добавления товара
cancelBtn.addEventListener('click', resetForm);

function resetForm() {
  productForm.reset();
  productIdInput.value = '';
  cancelBtn.style.display = 'none';
  formTitle.textContent = 'Добавить товар';
}

// Загрузка товаров при старте
loadProducts();
