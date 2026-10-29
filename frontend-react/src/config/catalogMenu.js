export const catalogDepartments = [
  {
    label: 'Electronics',
    category: 'Electronics',
    items: [
      { label: 'Phones & tablets', filter: 'phones-tablets' },
      { label: 'Audio', filter: 'audio' },
      { label: 'Computers', filter: 'computers' }
    ]
  },
  {
    label: 'Home & Living',
    category: 'Home & Living',
    items: [
      { label: 'Furniture', filter: 'furniture' },
      { label: 'Kitchen', filter: 'kitchen' },
      { label: 'Home decor', filter: 'home-decor' }
    ]
  },
  {
    label: 'Fashion',
    category: 'Fashion',
    items: [
      { label: 'Clothing', filter: 'clothing' },
      { label: 'Shoes', filter: 'shoes' },
      { label: 'Bags', filter: 'bags' }
    ]
  },
  {
    label: 'Groceries',
    category: 'Groceries',
    items: [
      { label: 'Pantry staples', filter: 'pantry-staples' },
      { label: 'Tea & beverages', filter: 'tea-beverages' },
      { label: 'Organic foods', filter: 'organic-foods' }
    ]
  },
  {
    label: 'Books & Stationery',
    category: 'Books & Stationery',
    items: [
      { label: 'Books & journals', filter: 'books-journals' },
      { label: 'Pens & writing', filter: 'pens-writing' },
      { label: 'Paper & supplies', filter: 'paper-supplies' }
    ]
  },
  {
    label: 'Beauty & Wellness',
    category: 'Beauty & Wellness',
    items: [
      { label: 'Skincare', filter: 'skincare' },
      { label: 'Health & wellness', filter: 'health-wellness' },
      { label: 'Personal care', filter: 'personal-care' }
    ]
  },
  {
    label: 'Accessories',
    filter: 'accessories',
    items: [
      { label: 'Bags', filter: 'bags' },
      { label: 'Watches', filter: 'watches' },
      { label: 'Everyday accessories', filter: 'everyday-accessories' }
    ]
  }
];

export const catalogQuickFilters = {
  'phones-tablets': { label: 'Phones & tablets', terms: ['phone', 'phones', 'mobile', 'mobiles', 'smartphone', 'smartphones', 'iphone', 'tablet', 'tablets'] },
  audio: { label: 'Audio', terms: ['audio', 'headphone', 'headphones', 'earbud', 'earbuds', 'speaker', 'speakers'] },
  computers: { label: 'Computers', terms: ['computer', 'computers', 'laptop', 'laptops', 'keyboard', 'keyboards', 'mouse', 'mice', 'monitor', 'monitors', 'desktop', 'desktops'] },
  furniture: { label: 'Furniture', terms: ['furniture', 'chair', 'chairs', 'desk', 'desks', 'sofa', 'sofas', 'table', 'tables'] },
  kitchen: { label: 'Kitchen', terms: ['kitchen', 'cookware', 'utensil', 'utensils', 'appliance', 'appliances', 'pot', 'pots', 'pan', 'pans'] },
  'home-decor': { label: 'Home decor', terms: ['decor', 'lamp', 'lamps', 'candle', 'candles', 'rug', 'rugs', 'vase', 'vases', 'light', 'lights'] },
  clothing: { label: 'Clothing', terms: ['clothing', 'shirt', 'shirts', 'jacket', 'jackets', 'hoodie', 'hoodies', 'dress', 'dresses', 'denim'] },
  shoes: { label: 'Shoes', terms: ['shoe', 'shoes', 'sneaker', 'sneakers', 'boot', 'boots', 'sandal', 'sandals'] },
  bags: { label: 'Bags', terms: ['bag', 'bags', 'backpack', 'backpacks'] },
  watches: { label: 'Watches', terms: ['watch', 'watches'] },
  'pantry-staples': { label: 'Pantry staples', terms: ['rice', 'oil', 'honey', 'flour', 'grain', 'lentil', 'spice', 'salt', 'sugar'] },
  'tea-beverages': { label: 'Tea & beverages', terms: ['tea', 'coffee', 'beverage', 'beverages', 'juice', 'water', 'drink', 'drinks'] },
  'organic-foods': { label: 'Organic foods', terms: ['organic', 'natural', 'honey', 'herbal'] },
  'books-journals': { label: 'Books & journals', terms: ['book', 'books', 'journal', 'journals', 'novel', 'paperback', 'hardcover'] },
  'pens-writing': { label: 'Pens & writing', terms: ['pen', 'pens', 'pencil', 'pencils', 'fountain', 'writing'] },
  'paper-supplies': { label: 'Paper & supplies', terms: ['paper', 'papers', 'notebook', 'notebooks', 'stationery', 'journal', 'journals'] },
  skincare: { label: 'Skincare', terms: ['skin', 'skincare', 'moisturizer', 'serum', 'cleanser', 'cream'] },
  'health-wellness': { label: 'Health & wellness', terms: ['vitamin', 'vitamins', 'supplement', 'supplements', 'wellness', 'health', 'herbal'] },
  'personal-care': { label: 'Personal care', terms: ['personal', 'care', 'makeup', 'lipstick', 'cosmetic', 'cosmetics', 'shampoo', 'body'] },
  accessories: { label: 'Accessories', terms: ['accessory', 'accessories', 'sunglasses', 'watch', 'watches', 'bag', 'bags', 'wallet', 'wallets', 'belt', 'belts', 'jewelry'] },
  'everyday-accessories': { label: 'Everyday accessories', terms: ['accessory', 'accessories', 'sunglasses', 'watch', 'watches', 'bag', 'bags', 'wallet', 'wallets', 'belt', 'belts', 'jewelry'] }
};

export function catalogHref({ category = '', filter = '' } = {}) {
  const params = new URLSearchParams();
  if (category) params.set('category', category);
  if (filter) params.set('filter', filter);
  return `/shop${params.size ? `?${params.toString()}` : ''}`;
}
