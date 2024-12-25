// Get data from sessionStorage or initialize if not available
function getFarmers() {
  return JSON.parse(sessionStorage.getItem('farmers')) || [];
}

function setFarmers(farmers) {
  sessionStorage.setItem('farmers', JSON.stringify(farmers));
}

function getPurchases() {
  return JSON.parse(sessionStorage.getItem('purchases')) || [];
}

function setPurchases(purchases) {
  sessionStorage.setItem('purchases', JSON.stringify(purchases));
}

function getOrders() {
  return JSON.parse(sessionStorage.getItem('orders')) || [];
}

function setOrders(orders) {
  sessionStorage.setItem('orders', JSON.stringify(orders));
}

// Kategorilere göre fiyatlar
const categoryPrices = {
  small: 10, // 100g için
  medium: 20, // 250g için
  large: 30, // 500g için
  extraLarge: 50, // 1kg için
  familyPack: 80, // 2kg için
  bulkPack: 150, // 5kg için
  premium: 200, // Özel ağırlık için
};

// Stok seviyelerini tutan nesne
let inventory = {
  small: 0,
  medium: 0,
  large: 0,
  extraLarge: 0,
  familyPack: 0,
  bulkPack: 0,
  premium: 0,
};



// Stok uyarısı
function checkRestockAlerts() {
  for (let category in inventory) {
    if (inventory[category] < 10) { // Örneğin, stok 10'un altına düşerse uyarı ver
      alert(`${category} kategorisi için stok seviyesi düşük!`);
    }
  }
}


// Sidebar navigation
function showSection(sectionId) {
  const sections = document.querySelectorAll('.content-section');
  sections.forEach(section => {
    section.style.display = 'none';
  });
  document.getElementById(sectionId).style.display = 'block';
}

// Open and Close Farmer Form
function openFarmerForm(farmerId = null) {
  const form = document.getElementById('farmer-form-container');
  form.style.display = 'block';
  
  if (farmerId) {
    const farmer = getFarmers().find(f => f.id === farmerId);
    document.getElementById('farmer-name').value = farmer.name;
    document.getElementById('farmer-contact').value = farmer.contact;
    document.getElementById('farmer-location').value = farmer.location;
    document.getElementById('farmer-id').value = farmer.id;  // Store the farmer id
  } else {
    document.getElementById('farmer-form').reset();
  }
}

function getNextFarmerId() {
  const farmers = getFarmers();
  if (farmers.length === 0) return 1; 
  const lastFarmer = farmers[farmers.length - 1]; 
  return lastFarmer.id + 1; 
}

function closeFarmerForm() {
  document.getElementById('farmer-form-container').style.display = 'none';
}

function saveFarmer(event) {
  event.preventDefault(); 

  const farmerId = parseInt(document.getElementById('farmer-id').value); 
  const name = document.getElementById('name').value;
  const contact = document.getElementById('contact').value;
  const location = document.getElementById('location').value;

  const farmers = getFarmers();
  const existingFarmerIndex = farmers.findIndex(f => f.id === farmerId);

  if (existingFarmerIndex !== -1) {
    const contactExists = farmers.some((farmer, index) => farmer.contact === contact && index !== existingFarmerIndex);
    if (contactExists) {
      alert("Bu telefon numarası ile başka bir farmer kaydedilmiş.");
      return;
    }
    farmers[existingFarmerIndex] = { id: farmerId, name, contact, location };
    alert("Farmer bilgileri güncellendi.");
  } else {
    const contactExists = farmers.some(farmer => farmer.contact === contact);
    if (contactExists) {
      alert("Bu telefon numarası ile başka bir farmer kaydedilmiş.");
      return;
    }
    const newFarmer = { id: farmerId, name, contact, location };
    farmers.push(newFarmer);
    alert("Yeni farmer kaydedildi.");
  }

  setFarmers(farmers);
  closeFarmerForm();
  renderFarmers();
}

function saveOrder(event, purchaseId = 0) {
  event.preventDefault(); // Prevent form's default behavior

  // Get form data
  const farmerId = parseInt(document.getElementById('order-farmer-id').value);
  const quantity = parseInt(document.getElementById('order-quantity').value);
  const pricePerKg = parseFloat(document.getElementById('order-price').value);

  // Validate input
  if (!farmerId || !quantity || !pricePerKg || isNaN(farmerId) || isNaN(quantity) || isNaN(pricePerKg)) {
    alert("Lütfen tüm alanları doğru şekilde doldurun.");
    return;
  }

  // Check if Farmer exists
  const farmers = getFarmers();
  const farmerExists = farmers.some(farmer => farmer.id === farmerId);
  if (!farmerExists) {
    alert("Geçerli bir Farmer ID bulunamadı. Lütfen doğru bir ID girin.");
    return;
  }

  // Calculate total price
  const totalPrice = quantity * pricePerKg;

  // Get existing orders
  const orders = getOrders();

  if (purchaseId > 0) {
    // Editing existing order
    const existingOrderIndex = orders.findIndex(order => order.purchaseId === purchaseId);

    if (existingOrderIndex !== -1) {
      orders[existingOrderIndex] = {
        purchaseId,
        farmerId,
        dateOfPurchase: orders[existingOrderIndex].dateOfPurchase,
        quantity,
        pricePerKg,
        totalPrice,
      };
      alert("Sipariş başarıyla güncellendi.");
    } else {
      alert("Düzenlenecek sipariş bulunamadı.");
      return;
    }
  } else {
    // Creating a new order
    const newPurchaseId = orders.length ? Math.max(...orders.map(order => order.purchaseId)) + 1 : 1;
    const newOrder = {
      purchaseId: newPurchaseId,
      farmerId,
      dateOfPurchase: new Date().toLocaleDateString(),
      quantity,
      pricePerKg,
      totalPrice,
    };
    orders.push(newOrder);
    alert("Yeni sipariş kaydedildi.");
  }

  // Save updated orders to sessionStorage
  setOrders(orders);
  closeOrderForm(); // Close the order form
  renderOrders();   // Re-render the orders table
}



function renderFarmers(farmers = null) {
  const farmersTable = document.getElementById('farmers-table').getElementsByTagName('tbody')[0];
  farmersTable.innerHTML = '';

  const farmersToRender = farmers || getFarmers();

  if (farmersToRender.length > 0) {
    farmersToRender.forEach(farmer => {
      const row = farmersTable.insertRow();
      row.innerHTML = `
        <td>${farmer.id}</td>
        <td>${farmer.name}</td>
        <td>${farmer.contact}</td>
        <td>${farmer.location}</td>
        <td>
          <button onclick="openFarmerForm(${farmer.id})">Düzenle</button>
          <button onclick="deleteFarmer(${farmer.id})">Sil</button>
        </td>
      `;
    });
  } else {
    farmersTable.innerHTML = `<tr><td colspan="5">Çiftçi bulunamadı.</td></tr>`;
  }
}

function deleteFarmer(id) {
  const farmers = getFarmers();
  const updatedFarmers = farmers.filter(f => f.id !== id);
  setFarmers(updatedFarmers);
  renderFarmers();
}

// Purchase Form
function openPurchaseForm() {
  document.getElementById('purchase-form-container').style.display = 'block';
}

function closePurchaseForm() {
  document.getElementById('purchase-form-container').style.display = 'none';
}

function savePurchase(event) {
  event.preventDefault();

  const farmerId = parseInt(document.getElementById('purchase-farmer-id').value);
  const date = document.getElementById('purchase-date').value;
  const quantity = parseInt(document.getElementById('purchase-quantity').value);
  const pricePerKg = parseFloat(document.getElementById('purchase-price').value);
  const totalCost = quantity * pricePerKg;
  const type = document.getElementById('purchase-type').value;

  const purchases = getPurchases();
  purchases.push({
    id: purchases.length + 1,
    farmerId,
    date,
    quantity,
    pricePerKg,
    totalCost,
    type
  });

  setPurchases(purchases);
  closePurchaseForm();
  renderPurchases();
}

// Render Purchases
function renderOrders() {
  const orders = getOrders();
  const ordersTable = document.getElementById('order-table').getElementsByTagName('tbody')[0];
  ordersTable.innerHTML = '';

  orders.forEach(order => {
    const row = ordersTable.insertRow();
    const farmerName = getFarmers().find(farmer => farmer.id === order.farmerId)?.name || "Bilinmeyen";

    row.innerHTML = `
      <td>${order.purchaseId}</td>
      <td>${order.farmerId} (${farmerName})</td>
      <td>${order.dateOfPurchase}</td>
      <td>${order.quantity}</td>
      <td>${order.pricePerKg}</td>
      <td>${order.totalPrice}</td>
      <td>
        <button onclick="editOrder(${order.purchaseId})">Düzenle</button>
        <button onclick="deleteOrder(${order.purchaseId})">Sil</button>
      </td>
    `;
  });
}
  
// Open and Close Order Form
function openOrderForm() {
  document.getElementById('order-form-container').style.display = 'block';
}

function closeOrderForm() {
  document.getElementById('order-form-container').style.display = 'none';
}

function saveOrder(event, purchaseId = 0) {
  event.preventDefault(); // Formun varsayılan davranışını engelle

  // Form alanlarından değerleri alın
  const farmerIdInput = document.getElementById('order-farmer-id');
  const quantityInput = document.getElementById('order-quantity');
  const priceInput = document.getElementById('order-price');

  // Değerleri doğrulayarak alın
  const farmerId = parseInt(farmerIdInput?.value || 0); // Eğer boşsa 0 kabul et
  const quantity = parseInt(quantityInput?.value || 0); // Eğer boşsa 0 kabul et
  const pricePerKg = parseFloat(priceInput?.value || 0); // Eğer boşsa 0 kabul et

  // Girişlerin doğruluğunu kontrol et
  if (!farmerId || !quantity || !pricePerKg || isNaN(farmerId) || isNaN(quantity) || isNaN(pricePerKg)) {
    alert("Lütfen tüm alanları doğru şekilde doldurun.");
    return;
  }

  // Farmer ID'nin geçerliliğini kontrol et
  const farmers = getFarmers();
  const farmerExists = farmers.some(farmer => farmer.id === farmerId);

  if (!farmerExists) {
    alert("Geçerli bir Farmer ID bulunamadı. Lütfen doğru bir ID girin.");
    return;
  }

  // Siparişe ait toplam fiyatı hesapla
  const totalPrice = quantity * pricePerKg;

  // Mevcut siparişleri al
  const orders = getOrders();

  if (purchaseId > 0) {
    // Eğer düzenleme yapılacaksa, mevcut siparişi bul ve güncelle
    const existingOrderIndex = orders.findIndex(order => order.purchaseId === purchaseId);

    if (existingOrderIndex !== -1) {
      // Mevcut siparişi güncelle
      orders[existingOrderIndex] = {
        purchaseId, // ID'yi koru
        farmerId,
        dateOfPurchase: orders[existingOrderIndex].dateOfPurchase, // Mevcut tarihi koruyun
        quantity,
        pricePerKg,
        totalPrice,
      };
      alert("Sipariş başarıyla güncellendi.");
    } else {
      alert("Düzenlenecek sipariş bulunamadı.");
      return;
    }
  } else {
    // Eğer yeni sipariş ekleniyorsa, yeni bir ID oluştur
    const newPurchaseId = orders.length ? Math.max(...orders.map(order => order.purchaseId)) + 1 : 1;

    // Yeni sipariş oluştur
    const newOrder = {
      purchaseId: newPurchaseId, // Yeni sipariş ID'sini oluştur
      farmerId,
      dateOfPurchase: new Date().toLocaleDateString(), // Bugünün tarihini ekle
      quantity,
      pricePerKg,
      totalPrice,
    };

    orders.push(newOrder);
    alert("Yeni sipariş kaydedildi.");
  }

  // Güncellenmiş siparişleri kaydet
  setOrders(orders);

  // Toplamları güncelle
  updateTotals();

  closeOrderForm(); // Formu kapat
  renderOrders();   // Sipariş tablosunu yeniden oluştur
}

// Toplamları güncelleyen fonksiyon
function updateTotals() {
  const orders = getOrders();

  // Toplam yaban mersini (kg) ve toplam maliyeti hesapla
  const totalBlueberries = orders.reduce((acc, order) => acc + order.quantity, 0);
  const totalCost = orders.reduce((acc, order) => acc + order.totalPrice, 0);

  // HTML öğelerine toplamları yaz
  document.getElementById('total-blueberries').textContent = totalBlueberries.toFixed(2);
  document.getElementById('total-cost').textContent = totalCost.toFixed(2);
}


function editOrder(purchaseId) {
  const orders = getOrders(); // Veritabanından siparişleri çek
  const order = orders.find(o => o.purchaseId === purchaseId);

  if (!order) {
    alert("Düzenlenecek sipariş bulunamadı.");
    return;
  }

  // Formu aç ve form elemanlarını doldur
  document.getElementById('order-form-container').style.display = 'block';
  document.getElementById('order-farmer-id').value = order.farmerId;
  document.getElementById('order-quantity').value = order.quantity;
  document.getElementById('order-price').value = order.pricePerKg;

  // Formun submit olayını, düzenleme için saveOrder fonksiyonu ile ilişkilendir
  document.getElementById('order-form').onsubmit = function (event) {
    saveOrder(event, purchaseId); // saveOrder fonksiyonunu ilgili purchaseId ile çağır
  };
}

function deleteOrder(purchaseId) {
  const orders = getOrders();
  const updatedOrders = orders.filter(order => order.purchaseId !== purchaseId);

  setOrders(updatedOrders); // Güncellenmiş sipariş listesini kaydet
  updateTotals();
  renderOrders(); // Tabloyu yeniden oluştur
}

// Sayfa yüklendiğinde siparişlerin görüntülenmesini sağla
window.onload = function() {
  renderOrders(); // Siparişlerin görüntülenmesi için renderOrders fonksiyonunu çağır
};

// Siparişleri görüntüle
function renderOrders() {
  const orders = getOrders(); // Siparişleri sessionStorage'dan al
  const ordersTable = document.getElementById('order-table').getElementsByTagName('tbody')[0];
  ordersTable.innerHTML = ''; // Tablonun mevcut içeriğini temizle

  if (orders.length === 0) {
    // Eğer sipariş yoksa, kullanıcıya mesaj göster
    ordersTable.innerHTML = `<tr><td colspan="7">Henüz sipariş yok.</td></tr>`;
  } else {
    // Sipariş varsa, her birini tabloya ekle
    orders.forEach(order => {
      const farmer = getFarmers().find(f => f.id === order.farmerId); // Çiftçiyi bul
      const farmerName = farmer ? farmer.name : "Bilinmeyen"; // Çiftçi bulunamazsa "Bilinmeyen" yaz

      const row = ordersTable.insertRow();
      row.innerHTML = `
        <td>${order.purchaseId}</td>
        <td>${farmerName}</td>
        <td>${order.dateOfPurchase}</td>
        <td>${order.quantity}</td>
        <td>${order.pricePerKg}</td>
        <td>${order.totalPrice}</td>
        <td>
          <button onclick="editOrder(${order.purchaseId})">Düzenle</button>
          <button onclick="deleteOrder(${order.purchaseId})">Sil</button>
        </td>
      `;
    });
  }

  // Toplamları güncelle
  updateTotals();
}


function openOrderForm() {
  document.getElementById('order-form-container').style.display = 'block';
}
function editOrder(purchaseId) {
  const orders = getOrders(); // Veritabanından siparişleri çek
  const order = orders.find(o => o.purchaseId === purchaseId);

  if (!order) {
    alert("Düzenlenecek sipariş bulunamadı.");
    return;
  }

  // Formu aç ve form elemanlarını doldur
  document.getElementById('order-form-container').style.display = 'block';
  document.getElementById('order-farmer-id').value = order.farmerId;
  document.getElementById('order-quantity').value = order.quantity;
  document.getElementById('order-price').value = order.pricePerKg;

  // Belirli bir sipariş id'si ile düzenleme yapma işlemi
  document.getElementById('order-form').onsubmit = function (event) {
    saveOrder(event, purchaseId); // saveOrder fonksiyonunu ilgili purchaseId ile çağır
  };
}

function filterFarmers() {
  const searchTerm = document.getElementById('search-name').value.toLowerCase();
  const farmers = getFarmers();
  const filteredFarmers = farmers.filter(farmer => {
    return farmer.name.toLowerCase().includes(searchTerm) || 
           farmer.location.toLowerCase().includes(searchTerm);
  });

  renderFarmers(filteredFarmers); // Render filtered farmers
}

function renderFarmers(farmers = null) {
  const farmersTable = document.getElementById('farmers-table').getElementsByTagName('tbody')[0];
  farmersTable.innerHTML = ''; // Mevcut içeriği temizle

  // Eğer parametre olarak çiftçi verileri verilmişse, o verileri kullan
  const farmersToRender = farmers || getFarmers(); // Eğer filtreleme yapılmadıysa, tüm çiftçileri al

  if (farmersToRender.length > 0) {
      farmersToRender.forEach(farmer => {
          const row = farmersTable.insertRow();
          row.innerHTML = `
              <td>${farmer.id}</td>
              <td>${farmer.name}</td>
              <td>${farmer.contact}</td>
              <td>${farmer.location}</td>
              <td>
                  <button onclick="openFarmerForm(${farmer.id})">Düzenle</button>
                  <button onclick="deleteFarmer(${farmer.id})">Sil</button>
              </td>
          `;
      });
  } else {
      // Eğer çiftçi verisi yoksa, kullanıcıya mesaj göster
      farmersTable.innerHTML = `<tr><td colspan="5">Çiftçi bulunamadı.</td></tr>`;
  }
}

function savePurchase(event) {
  event.preventDefault();

  const farmerId = parseInt(document.getElementById('purchase-farmer-id').value);
  const date = document.getElementById('purchase-date').value;
  const quantity = parseInt(document.getElementById('purchase-quantity').value);
  const pricePerKg = parseFloat(document.getElementById('purchase-price').value);
  const totalCost = quantity * pricePerKg;
  const type = document.getElementById('purchase-type').value;

  // Gider kaydını ekliyoruz
  saveExpense(totalCost);

  // Stok güncellemesini yapıyoruz
  updateInventory(quantity);

  const purchases = getPurchases();
  purchases.push({
      id: purchases.length + 1,
      farmerId,
      date,
      quantity,
      pricePerKg,
      totalCost,
      type
  });

  setPurchases(purchases);
  closePurchaseForm();
  renderPurchases();

  // Toplamları güncelle
  updateTotals();
}


// Gider kaydını kaydetmek için bir fonksiyon
function saveExpense(totalCost) {
  const expenses = JSON.parse(sessionStorage.getItem('expenses')) || [];
  expenses.push({
      id: expenses.length + 1,
      amount: totalCost,
      date: new Date().toLocaleDateString()
  });
  sessionStorage.setItem('expenses', JSON.stringify(expenses));
}

// Envanteri güncellemek için bir fonksiyon
function updateInventory(quantity) {
  const inventory = JSON.parse(sessionStorage.getItem('inventory')) || { blueberries: 0 };
  inventory.blueberries += quantity;  // Miktar ekleniyor
  sessionStorage.setItem('inventory', JSON.stringify(inventory));
}



function renderPurchases() {
  const purchases = getPurchases();
  const purchasesTable = document.getElementById('purchase-table').getElementsByTagName('tbody')[0];
  purchasesTable.innerHTML = '';

  purchases.forEach(purchase => {
    const row = purchasesTable.insertRow();
    const farmerName = getFarmers().find(farmer => farmer.id === purchase.farmerId)?.name || "Bilinmeyen";
    row.innerHTML = `
      <td>${purchase.id}</td>
      <td>${farmerName}</td>
      <td>${purchase.date}</td>
      <td>${purchase.quantity}</td>
      <td>${purchase.pricePerKg}</td>
      <td>${purchase.totalCost}</td>
      <td>
        <button onclick="editPurchase(${purchase.id})">Düzenle</button>
        <button onclick="deletePurchase(${purchase.id})">Sil</button>
      </td>
    `;
  });
}

function editPurchase(id) {
  const purchases = getPurchases();
  const purchase = purchases.find(p => p.id === id);

  if (!purchase) {
    alert("Düzenlenecek sipariş bulunamadı.");
    return;
  }

  document.getElementById('purchase-form-container').style.display = 'block';
  document.getElementById('purchase-farmer-id').value = purchase.farmerId;
  document.getElementById('purchase-date').value = purchase.date;
  document.getElementById('purchase-quantity').value = purchase.quantity;
  document.getElementById('purchase-price').value = purchase.pricePerKg;
}

function deletePurchase(id) {
  const purchases = getPurchases();
  const updatedPurchases = purchases.filter(p => p.id !== id);
  setPurchases(updatedPurchases);
  renderPurchases();
}

// Kategoriyi seçip paketleme yapacak fonksiyon
function categorizeAndPackageBlueberries() {
  const smallQuantity = parseInt(document.getElementById('small-quantity').value || 0);
  const mediumQuantity = parseInt(document.getElementById('medium-quantity').value || 0);
  const largeQuantity = parseInt(document.getElementById('large-quantity').value || 0);
  const extraLargeQuantity = parseInt(document.getElementById('extra-large-quantity').value || 0);
  const familyPackQuantity = parseInt(document.getElementById('family-pack-quantity').value || 0);
  const bulkPackQuantity = parseInt(document.getElementById('bulk-pack-quantity').value || 0);
  const premiumQuantity = parseInt(document.getElementById('premium-quantity').value || 0);

  // Toplam maliyet hesaplama
  const totalCost = (
    smallQuantity * categoryPrices.small +
    mediumQuantity * categoryPrices.medium +
    largeQuantity * categoryPrices.large +
    extraLargeQuantity * categoryPrices.extraLarge +
    familyPackQuantity * categoryPrices.familyPack +
    bulkPackQuantity * categoryPrices.bulkPack +
    premiumQuantity * categoryPrices.premium
  );

  // Stok güncellemeleri
  inventory.small += smallQuantity;
  inventory.medium += mediumQuantity;
  inventory.large += largeQuantity;
  inventory.extraLarge += extraLargeQuantity;
  inventory.familyPack += familyPackQuantity;
  inventory.bulkPack += bulkPackQuantity;
  inventory.premium += premiumQuantity;

  // Fiyatları güncelle
  document.getElementById('small-price').innerText = categoryPrices.small * smallQuantity;
  document.getElementById('medium-price').innerText = categoryPrices.medium * mediumQuantity;
  document.getElementById('large-price').innerText = categoryPrices.large * largeQuantity;
  document.getElementById('extra-large-price').innerText = categoryPrices.extraLarge * extraLargeQuantity;
  document.getElementById('family-pack-price').innerText = categoryPrices.familyPack * familyPackQuantity;
  document.getElementById('bulk-pack-price').innerText = categoryPrices.bulkPack * bulkPackQuantity;
  document.getElementById('premium-price').innerText = categoryPrices.premium * premiumQuantity;

  // Sonuçları göster
  alert(`Toplam Maliyet: ${totalCost} TL`);
  alert('Stoklar Güncellenmiştir.');
}

function packageBlueberries(category, quantity) {
  const inventory = getInventory(); // Envanteri al
  const availableKg = inventory[category]; // Belirli kategori için mevcut miktar
  
  if (availableKg < quantity) {
    alert("Yeterli miktar mevcut değil. Lütfen daha az miktar girin.");
    return;
  }
  
  // Paketleme işlemi başarılıysa, envanteri güncelle
  inventory[category] -= quantity; 
  setInventory(inventory); // Envanteri güncelle
  alert(`${quantity} kg ${category} başarıyla paketlendi.`);
  
  // Total ve envanter güncellemesi
  updateTotalCost();
  renderInventory(); // Envanteri ve fiyatları güncelle
}

function updateTotalCost() {
  const inventory = getInventory();
  let totalKg = 0;
  let totalPrice = 0;

  // Tüm kategorilerdeki toplam kg ve toplam fiyatı hesapla
  for (let category in inventory) {
    const price = getCategoryPrice(category);
    totalKg += inventory[category];
    totalPrice += inventory[category] * price;
  }

  // Toplam bilgileri güncelle
  document.getElementById('total-blueberries').textContent = totalKg;
  document.getElementById('total-cost').textContent = totalPrice.toFixed(2);
}



showSection('supplier-management');
showSection('sales-management');
renderFarmers();
renderPurchases();
renderOrders(); 
