const fs = require('fs');
const path = require('path');
const http = require('http');
const dotenv = require('dotenv');

dotenv.config({ path: '.env' });

const productMap = {
  'p_001': { dir: 'Resin', images: ['1.png', '2.png', '3.png'] },
  'p_002': { dir: 'resin pigment', images: ['6', '10'] },
  'p_003': { dir: 'resin pigment', images: ['6', '10'] },
  'p_004': { dir: 'candle pigments', images: ['candle colour for canldle making (1).png', 'candle colour for canldle making (2).png'] },
  'p_005': { dir: 'candle pigments', images: ['candle colour for canldle making (3).png', '8.png', '9.png'] },
  'p_006': { dir: 'eco-cast', images: ['1.png', '2.png', '3.png'] },
  'p_007': { dir: 'COMBOS', images: ['Combo - 1 ( heat gun)', 'Combo - 4'] },
  'p_008': { dir: 'COMBOS', images: ['Combo 2 (drill machine)', 'Combo-3'] },
  'p_009': { dir: 'HAND DRILL WITH 4 BITS', images: null },
  'p_010': { dir: 'COMBOS', images: ['Combo rh-734'] },
  'p_011': { dir: 'GLITTER', images: ['bold party', 'metallic essentials', 'nature'] },
  'p_012': { dir: 'Crushed glass', images: ['1-2 mm', '2-3 mm', '3-6 mm'] },
  'p_013': { dir: 'candle pigments', images: ['candle colour for canldle making (1).png'] },
  'p_014': { dir: 'candle pigments', images: ['candle colour for canldle making (2).png'] },
  'p_015': { dir: 'candle pigments', images: ['candle colour for canldle making (3).png'] },
  'p_016': { dir: 'Wick COMBOS', images: ['1', '2'] },
  'p_017': { dir: 'Wick COMBOS', images: ['3', '4'] },
  'p_018': { dir: 'Wick COMBOS', images: ['5'] },
  'p_019': { dir: 'Wick COMBOS', images: ['1', '5'] },
  'p_020': { dir: 'Jet lighter', images: null },
  'p_021': { dir: 'Fragrances', images: ['variation 1', 'variation 2', 'variation 3'] },
  'p_022': { dir: 'Soap dye', images: ['1.png', '2.png', '3.png'] },
  'p_023': { dir: 'Soap Dye + mould', images: null },
};

const PHOTOS_DIR = '/home/dmannu/quorin-site/app/public/PHOTOS';

function httpRequest(options, body) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(data) });
        } catch(e) {
          resolve({ status: res.statusCode, body: data });
        }
      });
    });
    req.on('error', reject);
    if (body) req.write(body);
    req.end();
  });
}

function authenticate() {
  const data = JSON.stringify({ email: 'admin@quorin.com', password: 'admin123' });
  return httpRequest({
    hostname: 'localhost',
    port: 9000,
    path: '/auth/user/emailpass',
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data) }
  }, data).then(r => r.body.token);
}

function uploadFilesToMedusa(token, filePaths) {
  return new Promise((resolve, reject) => {
    const boundary = '----MedusaUpload' + Date.now() + Math.random();
    const parts = [];
    
    for (const fp of filePaths) {
      const buf = fs.readFileSync(fp);
      const ext = path.extname(fp).toLowerCase();
      let mime = 'application/octet-stream';
      if (ext === '.png') mime = 'image/png';
      else if (ext === '.jpg' || ext === '.jpeg') mime = 'image/jpeg';
      else if (ext === '.webp') mime = 'image/webp';
      
      parts.push(Buffer.from(`------FormBoundary${boundary}\r\nContent-Disposition: form-data; name="files"; filename="${path.basename(fp)}"\r\nContent-Type: ${mime}\r\n\r\n`));
      parts.push(buf);
      parts.push(Buffer.from('\r\n'));
    }
    
    parts.push(Buffer.from(`------FormBoundary${boundary}--\r\n`));
    const totalLength = parts.reduce((s, p) => s + p.length, 0);
    
    const req = http.request({
      hostname: 'localhost',
      port: 9000,
      path: '/admin/uploads',
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': `multipart/form-data; boundary=----FormBoundary${boundary}`,
        'Content-Length': totalLength
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch(e) {
          reject(new Error(`Upload failed: ${res.statusCode} - ${data}`));
        }
      });
    });
    req.on('error', reject);
    parts.forEach(p => req.write(p));
    req.end();
  });
}

function updateProductImages(token, productId, imageUrls) {
  const data = JSON.stringify({ images: imageUrls.map(url => ({ url })) });
  return httpRequest({
    hostname: 'localhost',
    port: 9000,
    path: `/admin/products/${productId}`,
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(data)
    }
  }, data).then(r => {
    if (r.status >= 200 && r.status < 300) {
      return r.body.product;
    }
    throw new Error(`Update failed: ${r.status} - ${JSON.stringify(r.body)}`);
  });
}

async function main() {
  console.log('Authenticating...');
  const token = await authenticate();
  console.log('Authenticated!\n');
  
  let totalUploaded = 0;
  let totalFailed = 0;
  
  for (const [productId, mapping] of Object.entries(productMap)) {
    if (!mapping.images) {
      console.log(`[SKIP] ${productId}: No images specified`);
      continue;
    }
    
    const dirPath = path.join(PHOTOS_DIR, mapping.dir);
    if (!fs.existsSync(dirPath)) {
      console.log(`[SKIP] ${productId}: Directory not found: ${mapping.dir}`);
      totalFailed++;
      continue;
    }
    
    // Collect all image files for this product
    const imagePaths = [];
    
    for (const imageName of mapping.images) {
      const fullPath = path.join(dirPath, imageName);
      
      if (fs.statSync(fullPath).isDirectory()) {
        // Subdirectory - collect all images from it
        const files = fs.readdirSync(fullPath)
          .filter(f => /\.(png|jpg|jpeg|webp)$/i.test(f))
          .sort();
        for (const f of files) {
          imagePaths.push(path.join(fullPath, f));
        }
        console.log(`[${productId}] ${mapping.dir}/${imageName}: ${files.length} images`);
      } else if (fs.existsSync(fullPath)) {
        imagePaths.push(fullPath);
        console.log(`[${productId}] ${mapping.dir}/${imageName}: 1 image`);
      }
    }
    
    if (imagePaths.length === 0) {
      console.log(`[SKIP] ${productId}: No image files found in ${mapping.dir}`);
      continue;
    }
    
    console.log(`\n[UPLOAD] ${productId}: Uploading ${imagePaths.length} files...`);
    
    try {
      // Step 1: Upload files to /admin/uploads
      const uploadResult = await uploadFilesToMedusa(token, imagePaths);
      const uploadedFiles = uploadResult.files || [];
      console.log(`  Uploaded to Medusa: ${uploadedFiles.length} files`);
      
      for (const f of uploadedFiles) {
        console.log(`    → ${f.url}`);
      }
      
      // Step 2: Update product with image URLs
      const imageUrls = uploadedFiles.map(f => f.url);
      const updatedProduct = await updateProductImages(token, productId, imageUrls);
      
      console.log(`  Product ${productId} updated with ${updatedProduct.images?.length || 0} images`);
      totalUploaded += uploadedFiles.length;
    } catch(e) {
      console.log(`  ERROR: ${e.message}`);
      totalFailed++;
    }
    
    await new Promise(r => setTimeout(r, 300));
  }
  
  console.log(`\nDone! Uploaded: ${totalUploaded} files, Failed: ${totalFailed} products`);
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
