const fs = require('fs');
const path = require('path');
const file = path.join(process.cwd(), 'src/data/products.json');
const data = JSON.parse(fs.readFileSync(file, 'utf8'));
const groups = [
  ['ON', 0, 4],
  ['QC', 4, 6],
  ['BC', 6, 8],
  ['AB', 8, 10],
];
const assigned = new Map();
for (const [province, start, end] of groups) {
  for (let i = start; i < end && i < data.products.length; i += 1) assigned.set(data.products[i].id, province);
}
for (const [index, product] of data.products.entries()) {
  const province = assigned.get(product.id) || groups[index % groups.length][0];
  product.provinceAvailability = [province];
}
fs.writeFileSync(file, JSON.stringify(data, null, 2) + '\n');
console.log('Distributed products by province:', groups.map(([p, s, e]) => `${p}: ${Math.max(0, Math.min(e, data.products.length) - s)}`).join(', '));
