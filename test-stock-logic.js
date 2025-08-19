// Test logic kiểm tra stock mới
// File này để test logic, không cần thiết trong production

// Test case 1: Sản phẩm với stock_quantity = 0
const testProduct1 = {
  _id: "1",
  name: "Sản phẩm test 1",
  price: 100000,
  stock_quantity: 0,
  image_url: "https://example.com/image1.jpg"
};

// Test case 2: Sản phẩm với stock = 5
const testProduct2 = {
  _id: "2",
  name: "Sản phẩm test 2",
  price: 200000,
  stock: 5,
  image_url: "https://example.com/image2.jpg"
};

// Test case 3: Sản phẩm với quantity = 3
const testProduct3 = {
  _id: "3",
  name: "Sản phẩm test 3",
  price: 300000,
  quantity: 3,
  image_url: "https://example.com/image3.jpg"
};

// Test case 4: Sản phẩm với available_quantity = 2
const testProduct4 = {
  _id: "4",
  name: "Sản phẩm test 4",
  price: 400000,
  available_quantity: 2,
  image_url: "https://example.com/image4.jpg"
};

// Test case 5: Sản phẩm với inventory = 0
const testProduct5 = {
  _id: "5",
  name: "Sản phẩm test 5",
  price: 500000,
  inventory: 0,
  image_url: "https://example.com/image5.jpg"
};

// Test case 6: Sản phẩm có variants với stock
const testProduct6 = {
  _id: "6",
  name: "Sản phẩm test 6",
  price: 600000,
  stock_quantity: 0,
  variants: [
    { stock_quantity: 3, stock: 0 },
    { stock_quantity: 2, stock: 0 }
  ],
  image_url: "https://example.com/image6.jpg"
};

// Test case 7: Sản phẩm không có field stock nào (có thể từ API)
const testProduct7 = {
  _id: "7",
  name: "Sản phẩm test 7",
  price: 700000,
  // Không có field stock nào
  image_url: "https://example.com/image7.jpg"
};

// Logic kiểm tra stock mới
const getStockQuantity = (product) => {
  const possibleStockFields = [
    product.stock_quantity,
    product.stock,
    product.quantity,
    product.available_quantity,
    product.inventory
  ];
  
  for (const stock of possibleStockFields) {
    if (stock !== undefined && stock !== null && stock > 0) {
      return stock;
    }
  }
  
  return 0;
};

const isOutOfStock = (product) => {
  const mainStock = getStockQuantity(product);
  if (mainStock > 0) return false;
  
  // Kiểm tra variants nếu có
  if (product?.variants && product.variants.length > 0) {
    const totalStock = product.variants.reduce((sum, variant) => {
      const variantStock = variant.stock_quantity || variant.stock || variant.quantity || 0;
      return sum + variantStock;
    }, 0);
    return totalStock <= 0;
  }
  
  return mainStock <= 0;
};

// Test các trường hợp
console.log("=== Test Logic Stock Mới ===");
console.log("Test 1 - stock_quantity = 0:", isOutOfStock(testProduct1)); // Expected: true
console.log("Test 2 - stock = 5:", isOutOfStock(testProduct2)); // Expected: false
console.log("Test 3 - quantity = 3:", isOutOfStock(testProduct3)); // Expected: false
console.log("Test 4 - available_quantity = 2:", isOutOfStock(testProduct4)); // Expected: false
console.log("Test 5 - inventory = 0:", isOutOfStock(testProduct5)); // Expected: true
console.log("Test 6 - variants có stock:", isOutOfStock(testProduct6)); // Expected: false
console.log("Test 7 - không có field stock:", isOutOfStock(testProduct7)); // Expected: true

console.log("\n=== Chi tiết Stock ===");
console.log("Product 1 - Stock:", getStockQuantity(testProduct1));
console.log("Product 2 - Stock:", getStockQuantity(testProduct2));
console.log("Product 3 - Stock:", getStockQuantity(testProduct3));
console.log("Product 4 - Stock:", getStockQuantity(testProduct4));
console.log("Product 5 - Stock:", getStockQuantity(testProduct5));
console.log("Product 6 - Stock:", getStockQuantity(testProduct6));
console.log("Product 7 - Stock:", getStockQuantity(testProduct7));

console.log("\n=== Test với dữ liệu thực tế từ API ===");
// Test với dữ liệu có thể từ API
const realWorldProduct = {
  _id: "real1",
  name: "Sản phẩm thực tế",
  price: 150000,
  // Không có field stock nào
  image_url: "https://example.com/real.jpg"
};

console.log("Real world product - Stock:", getStockQuantity(realWorldProduct));
console.log("Real world product - Out of stock:", isOutOfStock(realWorldProduct));

// Test với sản phẩm có variants
const realWorldProductWithVariants = {
  _id: "real2",
  name: "Sản phẩm có variants",
  price: 250000,
  stock_quantity: 0,
  variants: [
    { stock_quantity: 5, stock: 0 },
    { stock_quantity: 3, stock: 0 }
  ],
  image_url: "https://example.com/real2.jpg"
};

console.log("Real world product with variants - Stock:", getStockQuantity(realWorldProductWithVariants));
console.log("Real world product with variants - Out of stock:", isOutOfStock(realWorldProductWithVariants));
