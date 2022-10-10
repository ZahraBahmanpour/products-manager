import {
  createNewProduct,
  deleteProduct,
  readProducts,
  updateProduct,
  currentProductId,
} from "./api.js";
import { debounce, gatherFormData, clearInputs } from "./utility.js";

export let queryString;
export let currentSort;
export let currentPage = 1;

export const productForm = document.querySelector("#create-product");

// EVENT LISTENERS

document.addEventListener("DOMContentLoaded", () => {
  readProducts();
});

document.querySelector("#btn-reset").addEventListener("click", () => {
  clearInputs();
  productForm.querySelector("#btn-add-product").innerHTML = "Add Product";
});

document.querySelector("#price").addEventListener("keypress", (event) => {
  if (event.keyCode < 46 || event.keyCode > 57) event.preventDefault();
});

document
  .querySelector("#countInStock")
  .addEventListener("keypress", (event) => {
    if (event.keyCode < 46 || event.keyCode > 57) event.preventDefault();
  });

const debouncedReadProducts = debounce(readProducts);
document.querySelector("#searchBox").addEventListener("input", (event) => {
  queryString = event.target.value.toLowerCase();
  debouncedReadProducts(queryString);
  resetPagination();
});

document.querySelector("#sortType").addEventListener("change", (event) => {
  currentSort = event.target.value;
  readProducts();
  resetPagination();
});

document.querySelector("ul.pagination").addEventListener("click", (event) => {
  const lis = document.querySelectorAll(".page-item");
  lis.forEach((li) => li.classList.remove("active"));
  event.target.parentElement.classList.add("active");
  currentPage = Number(event.target.innerText);
  readProducts();
});

document
  .querySelector("#confirm-delete-btn")
  .addEventListener("click", (event) => {
    deleteProduct(currentProductId);
  });

productForm.addEventListener("submit", determineCrudMode);

// END OF EVENT LISTENERS

// EVENT LISTENER CALLBACKS

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

export function resetPagination() {
  currentPage = 1;
  const lis = document.querySelectorAll(".page-item");
  lis.forEach((li) => li.classList.remove("active"));
  lis[0].classList.add("active");
}

// This is a test
