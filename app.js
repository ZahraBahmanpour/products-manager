const API_URL = 'https://62a4d0d547e6e4006398b48b.mockapi.io/api';
const DEFAULT_PAGE_COUNT = 10;
const SORT_BY_NAME = 'name';
const SORT_BY_CREATE_DATE = 'createdAt';

let currentProductId;
let currentSort;
let currentPage = 1;
let queryString;

const productsTable = document.querySelector('#products tbody');
const productForm = document.querySelector('#create-product');

// EVENT LISTENERS

document.addEventListener('DOMContentLoaded', () => {
  readProducts();
});

document.querySelector('#btn-reset').addEventListener('click', () => {
  clearInputs();
  productForm.querySelector('#btn-add-product').innerHTML = 'Add Product';
});

document.querySelector('#price').addEventListener('keypress', (event) => {
  if (event.keyCode < 46 || event.keyCode > 57) event.preventDefault();
});

document
  .querySelector('#countInStock')
  .addEventListener('keypress', (event) => {
    if (event.keyCode < 46 || event.keyCode > 57) event.preventDefault();
  });

const debouncedReadProducts = debounce(readProducts);
document.querySelector('#searchBox').addEventListener('input', (event) => {
  queryString = event.target.value.toLowerCase();
  debouncedReadProducts(queryString);
  resetPagination();
});

document.querySelector('#sortType').addEventListener('change', (event) => {
  currentSort = event.target.value;
  readProducts();
  resetPagination();
});

document.querySelector('ul.pagination').addEventListener('click', (event) => {
  const lis = document.querySelectorAll('.page-item');
  lis.forEach((li) => li.classList.remove('active'));
  event.target.parentElement.classList.add('active');
  currentPage = Number(event.target.innerText);
  readProducts();
});

document
  .querySelector('#confirm-delete-btn')
  .addEventListener('click', (event) => {
    deleteProduct(currentProductId);
  });

productForm.addEventListener('submit', determineCrudMode);

// END OF EVENT LISTENERS

// EVENT LISTENER CALLBACKS
function editProduct(product) {
  productForm.querySelector('#name').value = product.name;
  productForm.querySelector('#price').value = product.price;
  productForm.querySelector('#countInStock').value = product.countInStock;
  productForm.querySelector('#btn-add-product').innerHTML = 'Update Product';
  currentProductId = product.id;
}

function determineCrudMode(event) {
  event.preventDefault();
  let newProduct = gatherFormData();
  if (newProduct) {
    if (currentProductId) {
      updateProduct(event, { id: currentProductId, ...newProduct });
    } else {
      createNewProduct(newProduct);
    }
  }
}
// END OF EVENT LISTENER CALLBACKS

// API CALLS
// READ
function readProducts() {
  productsTable.innerHTML = '';
  fetch(
    `${API_URL}/products${generateQueryParams(
      currentPage,
      currentSort,
      queryString
    )}`
  )
    .then((response) => response.json())
    .then((data) => {
      const { products, count } = data;
      createPagination(count);
      products.forEach(addToDOM);
    });
}
/////// CREATE ///////

function createNewProduct(newProduct) {
  return fetch(`${API_URL}/products`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(newProduct),
  })
    .then((res) => res.json())
    .then((product) => {
      addToDOM(product);
      clearInputs();
    });
}

/////// UPDATE ///////
function updateProduct(event, product) {
  event.preventDefault();
  let updatedProduct = gatherFormData();
  updateOnBackend(updatedProduct, product.id).then(updateOnFrontEnd);
}

function updateOnBackend(updatedProduct, id) {
  return fetch(`${API_URL}/products/${id}`, {
    method: 'PUT',
    body: JSON.stringify(updatedProduct),
    headers: {
      'Content-Type': 'application/json',
    },
  }).then((res) => res.json());
}

function updateOnFrontEnd(product) {
  const productRow = productsTable.querySelector(`tr[data-id="${product.id}"]`);
  productRow.innerHTML = '';
  const { nameCell, priceCell, countCell, createDateCell, actionCell } =
    generateTableCells(product);
  productRow.appendChild(nameCell);
  productRow.appendChild(priceCell);
  productRow.appendChild(countCell);
  productRow.appendChild(createDateCell);
  productRow.appendChild(actionCell);
  document.querySelector('#btn-add-product').innerHTML = 'Add Product';
  clearInputs();
  currentProductId = undefined;
  showToast('Successfully Updated');
}

/////// DELETE ///////
function deleteProduct(productId) {
  return fetch(`${API_URL}/products/${productId}`, {
    method: 'DELETE',
  })
    .then((response) => response.json())
    .then(() => {
      showToast('Successfully Deleted');
      readProducts();
    });
}

// END OF API CALLS

// UPDATE DOM
function addToDOM(product) {
  const productRow = document.createElement('tr');
  productRow.dataset.id = product.id;
  const { nameCell, priceCell, countCell, createDateCell, actionCell } =
    generateTableCells(product);

  productRow.appendChild(nameCell);
  productRow.appendChild(priceCell);
  productRow.appendChild(countCell);
  productRow.appendChild(createDateCell);
  productRow.appendChild(actionCell);

  productsTable.appendChild(productRow);
}

function generateTableCells(product) {
  const nameCell = document.createElement('td');
  nameCell.innerHTML = product.name;

  const priceCell = document.createElement('td');
  priceCell.innerHTML = product.price;

  const countCell = document.createElement('td');
  countCell.innerHTML = product.countInStock;

  const createDateCell = document.createElement('td');
  createDateCell.innerHTML = new Date(product.createdAt).toDateString();

  const editButton = document.createElement('button');
  editButton.dataset.id = product.id;
  editButton.innerText = 'UPDATE';
  editButton.className = 'btn btn-primary btn-sm';
  editButton.addEventListener('click', () => editProduct(product));

  const deleteButton = document.createElement('button');
  deleteButton.dataset.id = product.id;
  deleteButton.innerText = 'DELETE';
  deleteButton.className = 'btn btn-danger btn-sm m-1';
  deleteButton.dataset.bsToggle = 'modal';
  deleteButton.dataset.bsTarget = '#deleteModal';
  deleteButton.addEventListener('click', () => (currentProductId = product.id));

  const actionCell = document.createElement('td');
  actionCell.appendChild(editButton);
  actionCell.appendChild(deleteButton);
  return { nameCell, priceCell, countCell, createDateCell, actionCell };
}
// END OF UPDATE DOM

// UTILITY
function debounce(cb, delay = 1000) {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => cb(...args), delay);
  };
}

function resetPagination() {
  currentPage = 1;
  const lis = document.querySelectorAll('.page-item');
  lis.forEach((li) => li.classList.remove('active'));
  lis[0].classList.add('active');
}

function createPagination(productCount) {
  const pageCount = Math.floor(productCount / DEFAULT_PAGE_COUNT);
  console.log(pageCount);
  let lis = '';
  for (let i = 1; i <= pageCount; i++) {
    lis += `<li class="page-item ${
      i === currentPage ? 'active' : ''
    }"><a href="#" class="page-link">${i}</a></li>`;
  }
  document.querySelector('ul.pagination').innerHTML = lis;
}

function generateQueryParams(page = 1, sort = SORT_BY_NAME, queryString = '') {
  let queryParams = `?page=${page}&limit=${DEFAULT_PAGE_COUNT}&sortBy=${sort}`;
  if (queryString !== '') {
    queryParams += `&name=${queryString}`;
  }
  return queryParams;
}

function clearInputs() {
  document.querySelector('#name').value = '';
  document.querySelector('#price').value = '';
  document.querySelector('#countInStock').value = '';
}

function gatherFormData() {
  const { name, price, countInStock } = event.target;
  if (name.value !== '' && price.value !== '' && countInStock !== '') {
    return {
      name: name.value,
      price: price.value,
      countInStock: countInStock.value,
    };
  }
  return undefined;
}
function showToast(message) {
  Toastify({
    text: `${message}`,
    duration: 4000,
    destination: '#',
    newWindow: true,
    close: true,
    gravity: 'bottom',
    position: 'right',
    stopOnFocus: true,
    style: {
      background: 'linear-gradient(to right, #00b09b, #96c93d)',
    },
    onClick: function () {}, // Callback after click
  }).showToast();
}
// END OF UTILITY
