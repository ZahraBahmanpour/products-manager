import { editModal } from "./api.js";
import { currentPage, currentPageSize, productForm } from "./app.js";

export const DEFAULT_PAGE_SIZE = 10;
const SORT_BY_NAME = "name";
const SORT_BY_CREATE_DATE = "createdAt";

export const clearInputs = () => {
  productForm.querySelector("#name").value = "";
  productForm.querySelector("#price").value = "";
  productForm.querySelector("#countInStock").value = "";
  productForm.querySelector("#product-display").src = "";
};

export const generateQueryParams = (
  page = 1,
  sort = SORT_BY_NAME,
  queryString = "",
  pageSize
) => {
  let queryParams = `?page=${page}&limit=${pageSize}&sortBy=${sort}`;
  if (queryString !== "") {
    queryParams += `&name=${queryString}`;
  }
  return queryParams;
};

export const createPagination = (productCount) => {
  const pageCount = Math.ceil(productCount / currentPageSize);

  let lis = `<li class="page-item ${
    Number(currentPage) === 1 ? "disabled no-events" : ""
  }" id="previous">
              <a class="page-link" href="#" aria-label="Previous">&laquo;</a>
            </li>`;

  for (let i = 1; i <= pageCount; i++) {
    lis += `<li id="page-${i}" class="page-item ${
      i === Number(currentPage) ? "active" : ""
    }"><a href="#" class="page-link">${i}</a></li>`;
  }

  lis += `<li class="page-item ${
    Number(currentPage) === pageCount ? "disabled no-events" : ""
  }" id="next" data-page-count="${pageCount}">
            <a class="page-link" href="#" aria-label="Next">&raquo;</a>
          </li>`;
  document.querySelector("ul.pagination").innerHTML = lis;
};

export const showToast = (message, color = "red") => {
  let gradiantColor =
    "linear-gradient(to right, rgb(255, 95, 109), rgb(255, 195, 113))";
  if (color === "green") {
    gradiantColor = "linear-gradient(to right, #00b09b, #96c93d)";
  }
  Toastify({
    text: `${message}`,
    duration: 4000,
    destination: "#",
    newWindow: true,
    close: true,
    gravity: "bottom",
    position: "right",
    stopOnFocus: true,
    style: {
      background: gradiantColor,
    },
    onClick: () => {},
  }).showToast();
};

export const debounce = (cb, delay = 1000) => {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => cb(...args), delay);
  };
};

export const gatherFormData = () => {
  const { name, price, countInStock } = event.target;
  if (name.value !== "" && price.value !== "" && countInStock !== "") {
    return {
      name: name.value,
      price: price.value,
      countInStock: countInStock.value,
    };
  }
  return undefined;
};

export const gatherEditFormData = () => {
  const name = editModal.querySelector("#name");
  const price = editModal.querySelector("#price");
  const countInStock = editModal.querySelector("#countInStock");
  const description = editModal.querySelector("#description");
  const department = editModal.querySelector("#department");
  const material = editModal.querySelector("#material");
  if (name.value !== "" && price.value !== "" && countInStock !== "") {
    return {
      name: name.value,
      price: price.value,
      countInStock: countInStock.value,
      description: description.value,
      department: department.value,
      material: material.value,
    };
  }
  return undefined;
};
