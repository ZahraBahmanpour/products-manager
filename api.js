import { queryString, currentSort, currentPage } from "./app.js";
import {
  clearInputs,
  createPagination,
  gatherEditFormData,
  gatherFormData,
  generateQueryParams,
  showToast,
} from "./utility.js";

const API_URL = "https://6300a18859a8760a757d441c.mockapi.io";

const productsTable = document.querySelector("#products tbody");
export const productEditModal = document.querySelector("#editModal");

/////// CREATE ///////
export async function createNewProduct() {
  event.preventDefault();
  let newProduct = gatherFormData();
  try {
    const res = await fetch(`${API_URL}/products`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(newProduct),
    });
    const createdProduct = await res.json();
    addToDOM(createdProduct);
    clearInputs();
    // const formData = new FormData();
    // formData.append("image", document.querySelector("#file-input").files[0]);
    // await fetch(`${API_URL}/upload`, { method: "POST", body: formData });
  } catch (error) {
    showToast("Problem occured while creating new product");
    console.log(error.message);
  }
}

// READ
export async function readProducts() {
  productsTable.innerHTML = "";
  try {
    const res = await fetch(
      `${API_URL}/products${generateQueryParams(
        currentPage,
        currentSort,
        queryString
      )}`
    );
    const data = await res.json();
    const { products, count } = data;
    createPagination(count);
    products.forEach(addToDOM);
  } catch (error) {
    showToast("Problem occured while reading products!");
    console.log(error.message);
  }
}
async function readProduct(id) {
  try {
    const res = await fetch(`${API_URL}/products/${id}`);
    return res.json();
  } catch (error) {
    showToast("Problem occured while reading product details!");
    console.log(error.message);
  }
}
/////// UPDATE ///////
export async function updateProduct(id) {
  const updatedProduct = gatherEditFormData();
  try {
    const updatedItem = await updateOnBackend(updatedProduct, id);
    updateOnFrontEnd(updatedItem);
  } catch (error) {
    showToast("Problem occured while updating product!");
    console.log(error.message);
  }
}

async function updateOnBackend(updatedProduct, id) {
  const res = await fetch(`${API_URL}/products/${id}`, {
    method: "PUT",
    body: JSON.stringify(updatedProduct),
    headers: {
      "Content-Type": "application/json",
    },
  });
  return await res.json();
}

function updateOnFrontEnd(product) {
  const productRow = productsTable.querySelector(`tr[data-id="${product.id}"]`);
  productRow.innerHTML = "";
  const { nameCell, priceCell, countCell, createDateCell, actionCell } =
    generateTableCells(product);
  productRow.appendChild(nameCell);
  productRow.appendChild(priceCell);
  productRow.appendChild(countCell);
  productRow.appendChild(createDateCell);
  productRow.appendChild(actionCell);
  document.querySelector("#btn-add-product").innerHTML = "Add Product";
  clearInputs();
  showToast("Successfully Updated", "green");
}
/////// DELETE ///////
export async function deleteProduct(productId) {
  try {
    const res = await fetch(`${API_URL}/products/${productId}`, {
      method: "DELETE",
    });
    const data = await res.json();
    showToast("Successfully Deleted");
    readProducts();
  } catch (error) {
    showToast("Problem occured deleting the product!");
    console.log(error.message);
  }
}

// UPDATE DOM
function addToDOM(product) {
  const productRow = document.createElement("tr");
  productRow.dataset.id = product.id;
  productRow.style.lineHeight = "40px";
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
  const nameCell = document.createElement("td");
  nameCell.innerHTML = product.name;
  nameCell.title = product.name;

  const priceCell = document.createElement("td");
  priceCell.innerHTML = product.price;
  priceCell.title = product.price;

  const countCell = document.createElement("td");
  countCell.innerHTML = product.countInStock;
  countCell.title = product.countInStock;

  const createDateCell = document.createElement("td");
  const date = new Date(product.createdAt).toDateString();
  createDateCell.innerHTML = date;
  createDateCell.title = date;

  const viewButton = document.createElement("button");
  viewButton.dataset.id = product.id;
  viewButton.innerHTML = '<i class="bi bi-eye"></i>';
  viewButton.title = "VIEW";
  viewButton.className = "btn btn-warning btn-sm m-1 text-white";
  viewButton.dataset.bsToggle = "modal";
  viewButton.dataset.bsTarget = "#viewModal";
  viewButton.addEventListener("click", () => viewProduct(product));

  const editButton = document.createElement("button");
  editButton.dataset.id = product.id;
  editButton.innerHTML = '<i class="bi bi-pen"></i>';
  editButton.title = "UPDATE";
  editButton.className = "btn btn-primary btn-sm";
  editButton.dataset.bsToggle = "modal";
  editButton.dataset.bsTarget = "#editModal";
  editButton.addEventListener("click", () => editProduct(product));

  const deleteButton = document.createElement("button");
  deleteButton.dataset.id = product.id;
  deleteButton.innerHTML = '<i class="bi bi-trash"></i>';
  deleteButton.title = "DELETE";
  deleteButton.className = "btn btn-danger btn-sm m-1";
  deleteButton.dataset.bsToggle = "modal";
  deleteButton.dataset.bsTarget = "#deleteModal";
  deleteButton.addEventListener("click", () => removeProduct(product.id));

  const actionCell = document.createElement("td");
  actionCell.appendChild(viewButton);
  actionCell.appendChild(editButton);
  actionCell.appendChild(deleteButton);
  return { nameCell, priceCell, countCell, createDateCell, actionCell };
}

function removeProduct(id) {
  document.querySelector("#confirm-delete-btn").dataset.id = id;
}

function editProduct(product) {
  productEditModal.querySelector("#name").value = product.name;
  productEditModal.querySelector("#price").value = product.price;
  productEditModal.querySelector("#countInStock").value = product.countInStock;
  productEditModal.querySelector("#confirm-edit-btn").dataset.id = product.id;
}

async function viewProduct(product) {
  const productWithDetails = await readProduct(product.id);
  const viewModal = document.querySelector("#viewModal .modal-body");
  viewModal.querySelector("#description").innerHTML =
    productWithDetails.description;
  viewModal.querySelector("#department").innerHTML =
    productWithDetails.department;
  viewModal.querySelector("#material").innerHTML = productWithDetails.material;
}
