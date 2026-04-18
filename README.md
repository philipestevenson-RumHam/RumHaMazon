# Philip's Store — GitHub Pages Product Store

A simple static website for selling Amazon products. Hosted on GitHub Pages.

## How It Works

### Product Data (`products.csv`)

All your products go in `products.csv` with these columns:

| Column | Description |
|--------|-------------|
| `Folder` | Folder name inside `products/` that contains the images (use lowercase, hyphens, no spaces) |
| `Name` | Product display name |
| `MyPrice` | Your asking price (number only, no $) |
| `AmazonPrice` | Current Amazon price (number only, no $) |
| `Details` | Product description (wrap in quotes if it contains commas) |

**Example:**
```csv
Folder,Name,MyPrice,AmazonPrice,Details
airpods-pro,AirPods Pro (2nd Generation),149.99,249.99,"Like new condition, includes all accessories."
```

### Product Images (`products/`)

Create a folder for each product inside `products/`. Name your images with numbers:

```
products/
├── airpods-pro/
│   ├── 1.jpg      ← shown on the grid card
│   ├── 2.jpg      ← additional photos for detail page
│   └── 3.jpg
├── kindle-paperwhite/
│   ├── 1.png
│   └── 2.png
└── echo-dot/
    └── 1.jpg
```

**Supported formats:** jpg, jpeg, png, gif, webp, avif

The first image (`1.jpg/png/etc`) is used as the product thumbnail on the main page.

## Adding a New Product

1. Add a row to `products.csv`
2. Create a folder in `products/` matching the `Folder` column
3. Drop numbered images in the folder
4. Commit and push to GitHub

## Deploying to GitHub Pages

1. Create a new repository on GitHub
2. Push all these files to the repository
3. Go to **Settings → Pages**
4. Set Source to **Deploy from a branch**, pick `main` and `/ (root)`
5. Your site will be live at `https://yourusername.github.io/repo-name/`

## Customization

- Edit the store name in `index.html` and `product.html` (search for "Philip's Store")
- Edit the contact message at the bottom of both HTML files
- Modify colors and styling in `style.css` (CSS variables at the top)
