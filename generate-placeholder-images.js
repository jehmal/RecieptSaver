const fs = require('fs');
const path = require('path');

// Simple PNG generator - creates a solid color PNG
function createSimplePNG(width, height, color, outputPath) {
    // PNG file signature
    const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
    
    // IHDR chunk
    const ihdr = createChunk('IHDR', Buffer.concat([
        Buffer.from(int32ToBytes(width)),
        Buffer.from(int32ToBytes(height)),
        Buffer.from([8, 2, 0, 0, 0]) // 8-bit depth, RGB color type
    ]));
    
    // Create image data (simple solid color)
    const pixelData = [];
    for (let y = 0; y < height; y++) {
        pixelData.push(0); // Filter type
        for (let x = 0; x < width; x++) {
            pixelData.push(color.r, color.g, color.b);
        }
    }
    
    // Compress using zlib
    const zlib = require('zlib');
    const compressed = zlib.deflateSync(Buffer.from(pixelData));
    
    // IDAT chunk
    const idat = createChunk('IDAT', compressed);
    
    // IEND chunk
    const iend = createChunk('IEND', Buffer.alloc(0));
    
    // Combine all chunks
    const png = Buffer.concat([signature, ihdr, idat, iend]);
    
    // Write to file
    fs.writeFileSync(outputPath, png);
    console.log(`Created: ${outputPath}`);
}

// Helper function to create PNG chunks
function createChunk(type, data) {
    const length = Buffer.from(int32ToBytes(data.length));
    const typeBuffer = Buffer.from(type, 'ascii');
    const crc = calculateCRC(Buffer.concat([typeBuffer, data]));
    const crcBuffer = Buffer.from(int32ToBytes(crc));
    
    return Buffer.concat([length, typeBuffer, data, crcBuffer]);
}

// Convert 32-bit integer to 4 bytes (big-endian)
function int32ToBytes(num) {
    return [
        (num >>> 24) & 0xFF,
        (num >>> 16) & 0xFF,
        (num >>> 8) & 0xFF,
        num & 0xFF
    ];
}

// CRC calculation for PNG chunks
function calculateCRC(data) {
    const crcTable = [];
    for (let n = 0; n < 256; n++) {
        let c = n;
        for (let k = 0; k < 8; k++) {
            c = ((c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1));
        }
        crcTable[n] = c;
    }
    
    let crc = 0xFFFFFFFF;
    for (let i = 0; i < data.length; i++) {
        crc = crcTable[(crc ^ data[i]) & 0xFF] ^ (crc >>> 8);
    }
    return crc ^ 0xFFFFFFFF;
}

// Create assets directory if it doesn't exist
const assetsDir = path.join(__dirname, 'assets');
if (!fs.existsSync(assetsDir)) {
    fs.mkdirSync(assetsDir, { recursive: true });
}

// Define blue color (RGB)
const blue = { r: 33, g: 150, b: 243 }; // Material Design Blue 500

// Generate placeholder images
const images = [
    { name: 'icon.png', width: 192, height: 192 },
    { name: 'splash.png', width: 1284, height: 2778 },
    { name: 'adaptive-icon.png', width: 512, height: 512 },
    { name: 'favicon.png', width: 48, height: 48 }
];

// Create each image
images.forEach(img => {
    const outputPath = path.join(assetsDir, img.name);
    createSimplePNG(img.width, img.height, blue, outputPath);
});

console.log('\nAll placeholder images have been generated successfully!');
console.log('Note: These are simple solid blue rectangles. For production, you should create proper images with text and design.');