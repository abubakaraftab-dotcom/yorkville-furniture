const fs = require('fs');
const path = require('path');
const file = path.join(process.cwd(), 'src/data/products.json');
const data = JSON.parse(fs.readFileSync(file, 'utf8'));

if (!data.products.some((product) => product.slug === 'yorkville-entryway-console')) {
  const source = data.products.find((product) => product.slug === 'minimalist-work-desk') || data.products[0];
  const product = JSON.parse(JSON.stringify(source));
  product.id = 'prod-010';
  product.slug = 'yorkville-entryway-console';
  product.title = 'Yorkville Entryway Console';
  product.description = 'A refined, space-conscious console designed for entryways, hallways, and living spaces. Its clean silhouette and warm wood finish bring practical storage and Canadian-inspired simplicity to the home.';
  product.shortDescription = 'Refined wood console for entryways and living spaces.';
  product.categorySlug = 'dressers';
  product.priceByProvince = { ON: 649.99, QC: 669.49, BC: 688.99, AB: 656.49 };
  product.compareAtPrice = 749.99;
  product.provinceAvailability = ['ON', 'QC', 'BC', 'AB'];
  product.sizes = [{ label: 'Console', dimensions: '120cm L x 38cm W x 78cm H', priceAdjustment: 0 }];
  product.stockQuantity = 6;
  product.featured = false;
  data.products.push(product);
  fs.writeFileSync(file, JSON.stringify(data, null, 2) + '\n');
  console.log('Added Yorkville Entryway Console as the tenth province-available listing.');
} else {
  console.log('Yorkville Entryway Console already exists.');
}
