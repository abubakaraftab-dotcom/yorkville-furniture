const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, '..', 'src', 'data', 'products.json');
const data = JSON.parse(fs.readFileSync(file, 'utf8'));
const quantities = [8, 3, 12, 6, 15, 4, 10, 2, 7, 13, 5, 11, 9, 1, 14];
data.products.forEach((product, index) => {
  product.stockQuantity = quantities[index % quantities.length];
  product.inStock = product.stockQuantity > 0;
});
fs.writeFileSync(file, JSON.stringify(data, null, 2) + '\n');
