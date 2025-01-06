document.addEventListener("DOMContentLoaded", () => {
  // Shared Data
  const breadTypes = [
    { name: "₦300 Bread", price: 300 },
    { name: "₦400 Bread", price: 400 },
    { name: "₦450 Bread", price: 450 },
    { name: "₦1000 Bread", price: 1000 },
    { name: "₦1200 Bread", price: 1200 },
  ];

  const currentInventory = JSON.parse(localStorage.getItem("inventory")) || {};
  const salesRecords = JSON.parse(localStorage.getItem("sales")) || [];

  // Page Identification
  const isStockPage = document.title.includes("Set Daily Stock");
  const isSalesPage = document.title.includes("Bakery Sales Management");

  // Populate Select Options
  function populateBreadOptions(selectElement) {
    breadTypes.forEach((bread) => {
      const option = document.createElement("option");
      option.value = bread.name;
      option.textContent = bread.name;
      selectElement.appendChild(option);
    });
  }

  // Save Inventory to LocalStorage
  function saveInventory() {
    localStorage.setItem("inventory", JSON.stringify(currentInventory));
  }

  // Save Sales to LocalStorage
  function saveSales() {
    localStorage.setItem("sales", JSON.stringify(salesRecords));
  }

  // Set Daily Stock Page Logic
  if (isStockPage) {
    const stockTypeSelect = document.getElementById("stock-type");
    const stockForm = document.getElementById("set-stock-form");
    const stockQuantityInput = document.getElementById("stock-quantity");
    const inventoryTableBody = document.querySelector("#current-inventory tbody");

    populateBreadOptions(stockTypeSelect);

    function renderInventory() {
      inventoryTableBody.innerHTML = "";
      breadTypes.forEach((bread) => {
        const quantity = currentInventory[bread.name] || 0;
        const row = `<tr>
                    <td>${bread.name}</td>
                    <td>₦${bread.price}</td>
                    <td>${quantity}</td>
                </tr>`;
        inventoryTableBody.insertAdjacentHTML("beforeend", row);
      });
    }

    stockForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const breadType = stockTypeSelect.value;
      const quantity = parseInt(stockQuantityInput.value);
      if (!isNaN(quantity) && quantity >= 0) {
        currentInventory[breadType] = quantity;
        saveInventory();
        renderInventory();
        stockForm.reset();
      }
    });

    renderInventory();
  }

  // Bakery Sales Management Page Logic
  if (isSalesPage) {
    const breadTypeSelect = document.getElementById("bread-type");
    const salesForm = document.getElementById("sales-form");
    const quantitySoldInput = document.getElementById("quantity-sold");
    const salesTableBody = document.getElementById("sales-table-body");
    const totalSalesElement = document.getElementById("total-sales");
    const downloadBtn = document.getElementById("download-btn");

    populateBreadOptions(breadTypeSelect);

    function renderSales() {
      salesTableBody.innerHTML = "";
      let totalSales = 0;
      salesRecords.forEach((record, index) => {
        const totalPrice = record.price * record.quantity;
        totalSales += totalPrice;
        const row = `<tr>
                    <td>${record.name}</td>
                    <td>₦${record.price}</td>
                    <td>${record.quantity}</td>
                    <td>₦${totalPrice}</td>
                    <td>
                        <button class="delete-btn" data-index="${index}">Delete</button>
                    </td>
                </tr>`;
        salesTableBody.insertAdjacentHTML("beforeend", row);
      });
      totalSalesElement.textContent = `₦${totalSales}`;

      // Add Delete Button Handlers
      document.querySelectorAll(".delete-btn").forEach((btn) => {
        btn.addEventListener("click", (e) => {
          const index = e.target.dataset.index;
          salesRecords.splice(index, 1);
          saveSales();
          renderSales();
        });
      });
    }

    salesForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const breadType = breadTypeSelect.value;
      const quantity = parseInt(quantitySoldInput.value);
      if (!isNaN(quantity) && quantity > 0 && currentInventory[breadType] >= quantity) {
        const bread = breadTypes.find((b) => b.name === breadType);
        salesRecords.push({ name: bread.name, price: bread.price, quantity });
        currentInventory[breadType] -= quantity;
        saveSales();
        saveInventory();
        renderSales();
        salesForm.reset();
      } else {
        alert("Invalid quantity or insufficient stock!");
      }
    });

    downloadBtn.addEventListener("click", () => {
      const rows = [["Bread Type", "Price", "Quantity Sold", "Total Price"]];
      salesRecords.forEach((record) => {
        const totalPrice = record.price * record.quantity;
        rows.push([record.name, record.price, record.quantity, totalPrice]);
      });

      const csvContent = "data:text/csv;charset=utf-8," + rows.map((row) => row.join(",")).join("\n");
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", "sales_records.csv");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    });

    renderSales();
  }
});
