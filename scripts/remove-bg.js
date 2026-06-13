/* eslint-disable @typescript-eslint/no-require-imports */
const Jimp = require('jimp');

async function removeBackground() {
  const imagePath = 'public/LogoKhoUI.png';
  const image = await Jimp.read(imagePath);
  
  // Let's sample a few points in the corners to get the average background color
  const corners = [
    Jimp.intToRGBA(image.getPixelColor(0, 0)),
    Jimp.intToRGBA(image.getPixelColor(image.bitmap.width - 1, 0)),
    Jimp.intToRGBA(image.getPixelColor(0, image.bitmap.height - 1)),
    Jimp.intToRGBA(image.getPixelColor(image.bitmap.width - 1, image.bitmap.height - 1))
  ];
  
  const bgColor = {
    r: corners.reduce((sum, c) => sum + c.r, 0) / 4,
    g: corners.reduce((sum, c) => sum + c.g, 0) / 4,
    b: corners.reduce((sum, c) => sum + c.b, 0) / 4,
  };
  
  const threshold = 40; // Tolerance for exact background match
  const smoothRange = 60; // Range for semi-transparent edges
  
  image.scan(0, 0, image.bitmap.width, image.bitmap.height, function(x, y, idx) {
    const r = this.bitmap.data[idx + 0];
    const g = this.bitmap.data[idx + 1];
    const b = this.bitmap.data[idx + 2];
    const a = this.bitmap.data[idx + 3];
    
    const dist = Math.sqrt(
      Math.pow(r - bgColor.r, 2) + 
      Math.pow(g - bgColor.g, 2) + 
      Math.pow(b - bgColor.b, 2)
    );
    
    if (dist < threshold) {
      this.bitmap.data[idx + 3] = 0; // Fully transparent
    } else if (dist < threshold + smoothRange) {
      // Soft transition for anti-aliasing
      const alphaFactor = Math.pow((dist - threshold) / smoothRange, 1.5);
      this.bitmap.data[idx + 3] = Math.floor(a * alphaFactor);
      
      // Also blend the color towards the original pixel slightly if needed,
      // but modifying alpha is usually enough.
    }
  });
  
  await image.writeAsync('public/LogoKhoUI.png');
  console.log('Background removed successfully!');
}

removeBackground().catch(console.error);
