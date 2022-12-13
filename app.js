import {
  createNewProduct,
  deleteProduct,
  readProducts,
  updateProduct,
  controller,
} from "./api.js";
import { debounce, clearInputs } from "./utility.js";

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

document
  .querySelector("ul.pagination")
  .addEventListener("click", async (event) => {
    event.preventDefault();
    const lis = document.querySelectorAll(".page-item");
    lis.forEach((li) => li.classList.remove("active"));
    event.target.parentElement.classList.add("active");
    currentPage = Number(event.target.innerText);
    await readProducts();
    window.scrollTo({ top: document.body.scrollHeight });
  });

document
  .querySelector("#confirm-delete-btn")
  .addEventListener("click", (event) => {
    const id = event.target.dataset.id;
    deleteProduct(id);
  });

document
  .querySelector("#confirm-edit-btn")
  .addEventListener("click", (event) => {
    const id = event.target.dataset.id;
    updateProduct(id);
  });

productForm.addEventListener("submit", createNewProduct);

document.getElementById("file-input").addEventListener("change", (e) => {
  if (e.target.files) {
    document.querySelector("#product-display").src = URL.createObjectURL(
      e.target.files[0]
    );
  }
});

const preventDragDefault = (e) => {
  e.stopPropagation();
  e.preventDefault();
};
document
  .querySelector(".image-selector")
  .addEventListener("dragover", (e) => preventDragDefault(e));
document
  .querySelector(".image-selector")
  .addEventListener("dragenter", (e) => preventDragDefault(e));

document.querySelector(".image-selector").addEventListener("drop", (e) => {
  preventDragDefault(e);
  if (e.dataTransfer.files) {
    document.querySelector("#product-display").src = URL.createObjectURL(
      e.dataTransfer.files[0]
    );
  }
});

document.querySelector("#cancel-request").addEventListener("click", () => {
  controller.abort();
});

// END OF EVENT LISTENERS

export const resetPagination = () => {
  currentPage = 1;
  const lis = document.querySelectorAll(".page-item");
  lis.forEach((li) => li.classList.remove("active"));
  lis[0].classList.add("active");
};
