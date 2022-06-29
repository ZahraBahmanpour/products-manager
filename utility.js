import { currentPage } from './app.js';

const DEFAULT_PAGE_COUNT = 10;
const SORT_BY_NAME = 'name';
const SORT_BY_CREATE_DATE = 'createdAt';

export function clearInputs() {
  document.querySelector('#name').value = '';
  document.querySelector('#price').value = '';
  document.querySelector('#countInStock').value = '';
}

export function generateQueryParams(
  page = 1,
  sort = SORT_BY_NAME,
  queryString = ''
) {
  let queryParams = `?page=${page}&limit=${DEFAULT_PAGE_COUNT}&sortBy=${sort}`;
  if (queryString !== '') {
    queryParams += `&name=${queryString}`;
  }
  return queryParams;
}

export function createPagination(productCount) {
  const pageCount = Math.floor(productCount / DEFAULT_PAGE_COUNT);
  let lis = '';
  for (let i = 1; i <= pageCount; i++) {
    lis += `<li class="page-item ${
      i === currentPage ? 'active' : ''
    }"><a href="#" class="page-link">${i}</a></li>`;
  }
  document.querySelector('ul.pagination').innerHTML = lis;
}

export function showToast(message) {
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

export function debounce(cb, delay = 1000) {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => cb(...args), delay);
  };
}

export function gatherFormData() {
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
