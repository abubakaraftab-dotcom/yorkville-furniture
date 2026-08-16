const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, '..', 'src', 'data', 'products.json');
const data = JSON.parse(fs.readFileSync(file, 'utf8'));
for (const product of data.products) {
  if (Array.isArray(product.sizes) && product.sizes.length > 1) {
    product.sizes = [product.sizes[0]];
  }
}
fs.writeFileSync(file, JSON.stringify(data, null, 2) + '\n');
