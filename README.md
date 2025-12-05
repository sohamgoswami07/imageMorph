# ImageMorph on Text Hover - Vanilla Version

This is a pure vanilla HTML, CSS, and JavaScript implementation of the ImageMorph on Text Hover project. No build tools or bundlers required!

## 📁 Project Structure

```
vanilla/
├── index.html          # Main HTML file
├── style.css           # All styles (converted from TailwindCSS)
├── script.js           # Vanilla JavaScript (converted from React)
├── photos/             # Brand images folder
│   ├── adidas.webp
│   ├── asics.webp
│   ├── calvin-klein.webp
│   ├── decathlon.webp
│   ├── fila.webp
│   ├── new-balance.webp
│   ├── nike.webp
│   ├── puma.webp
│   └── salomon.webp
└── README.md           # This file
```

## 🚀 How to Run

1. Simply open `index.html` in any modern web browser
2. No installation or build process needed!

## 📚 Libraries Used (via CDN)

- **GSAP 3.12.5** - For smooth animations
- **CustomEase** - For custom easing curves
- **Google Fonts** - DM Sans and IBM Plex Mono

All libraries are loaded directly from CDN, so no npm installation required.

## ✨ Features

- Smooth hover animations on brand names
- Dynamic image morphing effect
- Scroll indicator dots
- Mix-blend-mode for text contrast
- Fully responsive design
- Custom GSAP easing ("hop" animation)

## 🎨 How It Works

1. **Hover Effect**: When you hover over a brand name, an image smoothly animates in using clip-path and scale animations
2. **Scroll Detection**: As you scroll through the brand list, the nearest brand automatically activates
3. **Indicator Dots**: Right-side dots show which brand is currently active
4. **Mix Blend Mode**: Brand names use difference blend mode to stay visible over images

## 🔧 Customization

To add more brands, edit the `brands` array in `script.js`:

```javascript
const brands = [
  { img: "photos/your-image.webp", title: "Your Brand" },
];
```

Then add the corresponding image to the `photos/` folder.

## 📱 Browser Compatibility

Works in all modern browsers that support:

- CSS Grid & Flexbox
- CSS clip-path
- GSAP 3.x
- ES6 JavaScript

## 💡 Notes

- Images should be in WebP format for best performance
- The mix-blend-mode creates the text contrast effect
- All animations are GPU-accelerated for smooth performance
