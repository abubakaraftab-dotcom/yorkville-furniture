const fs = require('fs');
const path = require('path');

const file = path.join(process.cwd(), 'src/data/products.json');
const data = JSON.parse(fs.readFileSync(file, 'utf8'));
const provinceFactors = { QC: 1.03, BC: 1.06, AB: 1.01 };
const provinceCodes = Object.keys(provinceFactors);

for (const [index, product] of data.products.entries()) {
  if (!product.priceByProvince || product.priceByProvince.ON === undefined) continue;
  if (index < 12) {
    for (const code of provinceCodes) {
      const factor = provinceFactors[code];
      product.priceByProvince[code] = Number((product.priceByProvince.ON * factor).toFixed(2));
    }
    product.provinceAvailability = Array.from(new Set([...(product.provinceAvailability || []), 'ON', ...provinceCodes]));
  } else {
    for (const code of provinceCodes) delete product.priceByProvince[code];
    product.provinceAvailability = (product.provinceAvailability || []).filter((code) => code === 'ON');
  }
}

fs.writeFileSync(file, JSON.stringify(data, null, 2) + '\n');
console.log('Province availability updated: first 12 products enabled for ON, QC, BC, and AB.');
