// Simple icon generator script
// This creates placeholder icons until you can use a proper icon generator

const fs = require('fs');
const path = require('path');

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const iconsDir = path.join(__dirname, 'public', 'icons');

// Ensure icons directory exists
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// Create simple SVG icons for each size
sizes.forEach(size => {
  const svg = `<svg width="${size}" height="${size}" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#3b82f6;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#1e40af;stop-opacity:1" />
    </linearGradient>
    <linearGradient id="dice" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#ffffff;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#e5e7eb;stop-opacity:1" />
    </linearGradient>
  </defs>
  
  <rect width="512" height="512" fill="url(#bg)" rx="51.2"/>
  
  <g transform="translate(256,256)">
    <polygon points="-80,-60 0,-100 80,-60 80,40 40,80 -40,80 -80,40" 
             fill="url(#dice)" 
             stroke="#374151" 
             stroke-width="3"/>
    
    <polygon points="-80,-60 0,-100 0,-20 -40,-20" 
             fill="#f9fafb" 
             stroke="#374151" 
             stroke-width="2"/>
    
    <polygon points="0,-100 80,-60 40,0 0,-20" 
             fill="#f3f4f6" 
             stroke="#374151" 
             stroke-width="2"/>
    
    <polygon points="-40,-20 40,-20 40,40 -40,40" 
             fill="#ffffff" 
             stroke="#374151" 
             stroke-width="2"/>
    
    <text x="0" y="20" 
          font-family="Arial, sans-serif" 
          font-size="36" 
          font-weight="bold" 
          text-anchor="middle" 
          fill="#1f2937">20</text>
  </g>
  
  <g transform="translate(390,390)" opacity="0.7">
    <circle cx="0" cy="0" r="15" fill="none" stroke="#ffffff" stroke-width="3"/>
    <circle cx="0" cy="0" r="25" fill="none" stroke="#ffffff" stroke-width="2" opacity="0.7"/>
    <circle cx="0" cy="0" r="35" fill="none" stroke="#ffffff" stroke-width="1" opacity="0.5"/>
  </g>
</svg>`;

  const filename = `icon-${size}x${size}.png`;
  const svgFilename = `icon-${size}x${size}.svg`;
  
  // Save SVG version (browsers can use these)
  fs.writeFileSync(path.join(iconsDir, svgFilename), svg);
  
  console.log(`✅ Created ${svgFilename}`);
});

console.log('\n🎲 Icon files created!');
console.log('\n📝 Next steps:');
console.log('1. Use an online SVG to PNG converter to create PNG versions');
console.log('2. Or visit: https://progressier.com/pwa-icons-and-ios-splash-screen-generator');
console.log('3. Upload the main icon.svg file to generate all required sizes');
console.log('4. Replace the SVG files with the generated PNG files');