const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, '..', 'src', 'data', 'products.json');
const data = JSON.parse(fs.readFileSync(file, 'utf8'));
for (const product of data.products) {
  const ontarioPrice = product.priceByProvince?.ON;
  product.priceByProvince = ontarioPrice === undefined ? {} : { ON: ontarioPrice };
  product.provinceAvailability = ontarioPrice === undefined ? [] : ['ON'];
  product.material = 'Wood';
  product.assemblyRequired = false;
  product.deliveryEstimate = '1–3 days';
}
fs.writeFileSync(file, JSON.stringify(data, null, 2) + '\n');
