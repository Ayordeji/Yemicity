// Shared Data
const breadPrices = {
  300: 300,
  400: 400,
  500: 500,
  600: 600,
  1000: 1000,
  1200: 1200,
};

let inventory = JSON.parse(localStorage.getItem("bakeryInventory")) || {};
let salesRecords = JSON.parse(localStorage.getItem("bakerySales")) || {};

// Populate Dropdown
const populateDropdowns = () => {
  const types = Object.keys(breadPrices);
  const stockType = document.getElementById("stock-type");
  const salesType = document.getElementById("sales-type");
  if (stockType) stockType.innerHTML = "";
  if (salesType) salesType.innerHTML = "";

  types.forEach((price) => {
    const option = `<option value="${price}">Bread - Price: #${price}</option>`;
    if (stockType) stockType.innerHTML += option;
    if (salesType) salesType.innerHTML += option;
  });
};

// Update Tables
const updateInventoryTable = () => {
  const tbody = document.querySelector("#current-inventory tbody");
  if (!tbody) return;
  tbody.innerHTML = Object.entries(inventory)
    .map(([type, quantity]) => `<tr><td>Bread - Price: #${type}</td><td>#${type}</td><td>${quantity}</td></tr>`)
    .join("");
};

const updateSalesTable = () => {
  const tbody = document.querySelector("#sales-table tbody");
  const stockTbody = document.querySelector("#stock-left-table tbody");
  if (!tbody || !stockTbody) return;

  tbody.innerHTML = Object.entries(salesRecords)
    .map(([type, { quantity, total }]) => `<tr><td>Bread - Price: #${type}</td><td>#${type}</td><td>${quantity}</td><td>#${total}</td></tr>`)
    .join("");

  stockTbody.innerHTML = Object.entries(inventory)
    .map(([type, quantity]) => `<tr><td>Bread - Price: #${type}</td><td>${quantity}</td></tr>`)
    .join("");
};

// Handlers
const handleSetStock = (e) => {
  e.preventDefault();
  const type = document.getElementById("stock-type").value;
  const quantity = parseInt(document.getElementById("stock-quantity").value, 10);
  if (!type || isNaN(quantity) || quantity < 0) return alert("Invalid input");

  inventory[type] = quantity;
  localStorage.setItem("bakeryInventory", JSON.stringify(inventory));
  updateInventoryTable();
};

const handleRecordSale = (e) => {
  e.preventDefault();
  const type = document.getElementById("sales-type").value;
  const quantity = parseInt(document.getElementById("sales-quantity").value, 10);
  if (!type || isNaN(quantity) || quantity < 0 || inventory[type] < quantity) return alert("Invalid sale");

  inventory[type] -= quantity;
  salesRecords[type] = salesRecords[type] || { quantity: 0, total: 0 };
  salesRecords[type].quantity += quantity;
  salesRecords[type].total += quantity * breadPrices[type];

  localStorage.setItem("bakeryInventory", JSON.stringify(inventory));
  localStorage.setItem("bakerySales", JSON.stringify(salesRecords));
  updateSalesTable();
};

const downloadCSV = () => {
  const rows = [["Bread Type", "Price", "Quantity Sold", "Total Sale"]];
  for (const [type, { quantity, total }] of Object.entries(salesRecords)) {
    rows.push([`Bread - Price: #${type}`, type, quantity, total]);
  }

  const csvContent = rows.map((row) => row.join(",")).join("\\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "bakery_sales.csv";
  link.click();
};

// Initialize
window.addEventListener("DOMContentLoaded", () => {
  populateDropdowns();
  updateInventoryTable();
  updateSalesTable();

  const setStockForm = document.getElementById("set-stock-form");
  const salesForm = document.getElementById("sales-form");
  const downloadBtn = document.getElementById("download-btn");

  if (setStockForm) setStockForm.addEventListener("submit", handleSetStock);
  if (salesForm) salesForm.addEventListener("submit", handleRecordSale);
  if (downloadBtn) downloadBtn.addEventListener("click", downloadCSV);
});
