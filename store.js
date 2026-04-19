/* ── CSV Parser ── */
function parseCSV(text) {
  const lines = text.trim().split('\n');
  const headers = parseCSVLine(lines[0]);
  return lines.slice(1).filter(l => l.trim()).map(line => {
    const vals = parseCSVLine(line);
    const obj = {};
    headers.forEach((h, i) => obj[h.trim()] = (vals[i] || '').trim());
    return obj;
  });
}

function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"' && line[i + 1] === '"') { current += '"'; i++; }
      else if (ch === '"') { inQuotes = false; }
      else { current += ch; }
    } else {
      if (ch === '"') { inQuotes = true; }
      else if (ch === ',') { result.push(current); current = ''; }
      else { current += ch; }
    }
  }
  result.push(current);
  return result;
}

/* ── Image Manifest ── */
let imageManifest = null;

async function loadImageManifest() {
  if (imageManifest) return imageManifest;
  try {
    const resp = await fetch('images.json');
    if (resp.ok) {
      imageManifest = await resp.json();
      return imageManifest;
    }
  } catch (e) { /* fall through */ }
  imageManifest = {};
  return imageManifest;
}

function getImages(folder) {
  const files = imageManifest[folder] || [];
  return files.map(f => `products/${folder}/${f}`);
}

/* ── Product Grid (index.html) ── */
async function initGrid() {
  const grid = document.getElementById('product-grid');
  const loading = document.getElementById('loading');
  const emptyState = document.getElementById('empty-state');
  const searchInput = document.getElementById('search');
  const itemCount = document.getElementById('item-count');
  if (!grid) return;

  let products;
  try {
    const [csvResp] = await Promise.all([
      fetch('products.csv'),
      loadImageManifest()
    ]);
    products = parseCSV(await csvResp.text());
  } catch (e) {
    loading.textContent = 'Could not load products.csv';
    return;
  }

  // Attach images from manifest (instant, no network requests)
  for (const p of products) {
    p._images = getImages(p.Folder);
  }

  loading.style.display = 'none';
  itemCount.textContent = `${products.length} item${products.length !== 1 ? 's' : ''} available`;

  function render(filtered) {
    grid.innerHTML = '';
    if (filtered.length === 0) {
      emptyState.style.display = 'block';
      return;
    }
    emptyState.style.display = 'none';

    filtered.forEach(p => {
      const savings = parseFloat(p.AmazonPrice) - parseFloat(p.MyPrice);
      const pct = Math.round((savings / parseFloat(p.AmazonPrice)) * 100);

      const card = document.createElement('a');
      card.href = `product.html?folder=${encodeURIComponent(p.Folder)}`;
      card.className = 'product-card';
      card.innerHTML = `
        ${p._images.length > 0
          ? `<img class="card-image" src="${p._images[0]}" alt="${esc(p.Name)}" loading="lazy">`
          : `<div class="card-image-placeholder">No image</div>`}
        <div class="card-body">
          <h3>${esc(p.Name)}</h3>
          <div class="price-row">
            <span class="my-price">$${esc(p.MyPrice)}</span>
            <span class="amazon-price">$${esc(p.AmazonPrice)}</span>
            ${savings > 0 ? `<span class="discount-badge">${pct}% off</span>` : ''}
          </div>
          <span class="view-btn">View Details</span>
        </div>`;
      grid.appendChild(card);
    });
  }

  render(products);

  searchInput.addEventListener('input', () => {
    const q = searchInput.value.toLowerCase();
    render(products.filter(p =>
      p.Name.toLowerCase().includes(q) ||
      p.Details.toLowerCase().includes(q)
    ));
  });
}

/* ── Product Detail (product.html) ── */
async function initDetail() {
  const detail = document.getElementById('detail');
  const loading = document.getElementById('loading');
  if (!detail) return;

  const params = new URLSearchParams(window.location.search);
  const folder = params.get('folder');
  if (!folder) { loading.textContent = 'No product specified.'; return; }

  let products;
  try {
    const [csvResp] = await Promise.all([
      fetch('products.csv'),
      loadImageManifest()
    ]);
    products = parseCSV(await csvResp.text());
  } catch (e) {
    loading.textContent = 'Could not load products.csv';
    return;
  }

  const product = products.find(p => p.Folder === folder);
  if (!product) { loading.textContent = 'Product not found.'; return; }

  const images = getImages(folder);

  document.title = `${product.Name} — Philip's Store`;
  document.getElementById('product-name').textContent = product.Name;
  document.getElementById('my-price').textContent = `$${product.MyPrice}`;
  document.getElementById('amazon-price').textContent = `Amazon: $${product.AmazonPrice}`;
  document.getElementById('product-details').textContent = product.Details;

  const savings = parseFloat(product.AmazonPrice) - parseFloat(product.MyPrice);
  const pct = Math.round((savings / parseFloat(product.AmazonPrice)) * 100);
  const badge = document.getElementById('discount-badge');
  if (savings > 0) {
    badge.textContent = `Save $${savings.toFixed(2)} (${pct}% off Amazon)`;
  } else {
    badge.style.display = 'none';
  }

  // Carousel
  const carousel = document.getElementById('carousel');
  const thumbnails = document.getElementById('thumbnails');

  if (images.length > 0) {
    let current = 0;
    carousel.innerHTML = `
      <img id="carousel-img" src="${images[0]}" alt="${esc(product.Name)}">
      ${images.length > 1 ? `
        <button class="carousel-btn prev" id="prev-btn">‹</button>
        <button class="carousel-btn next" id="next-btn">›</button>
        <div class="carousel-dots" id="dots"></div>
      ` : ''}`;

    if (images.length > 1) {
      const dotsEl = document.getElementById('dots');
      images.forEach((_, i) => {
        const dot = document.createElement('button');
        if (i === 0) dot.className = 'active';
        dot.addEventListener('click', () => goTo(i));
        dotsEl.appendChild(dot);
      });

      images.forEach((src, i) => {
        const thumb = document.createElement('img');
        thumb.src = src;
        thumb.className = 'thumb' + (i === 0 ? ' active' : '');
        thumb.addEventListener('click', () => goTo(i));
        thumbnails.appendChild(thumb);
      });

      function goTo(idx) {
        current = idx;
        document.getElementById('carousel-img').src = images[current];
        dotsEl.querySelectorAll('button').forEach((d, i) => d.className = i === current ? 'active' : '');
        thumbnails.querySelectorAll('.thumb').forEach((t, i) => t.className = 'thumb' + (i === current ? ' active' : ''));
      }

      document.getElementById('prev-btn').addEventListener('click', () => goTo((current - 1 + images.length) % images.length));
      document.getElementById('next-btn').addEventListener('click', () => goTo((current + 1) % images.length));
    }
  }

  loading.style.display = 'none';
  detail.style.display = 'block';
}

/* ── Utility ── */
function esc(str) {
  const el = document.createElement('span');
  el.textContent = str;
  return el.innerHTML;
}

/* ── Init ── */
document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('product-grid')) initGrid();
  if (document.getElementById('detail')) initDetail();
});
