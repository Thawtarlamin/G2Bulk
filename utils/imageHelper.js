const axios = require('axios');
const fs = require('fs');
const path = require('path');

/**
 * Download image from URL and save to local storage
 * @param {string} imageUrl - The URL of the image to download
 * @param {string} fileName - The name to save the file as
 * @returns {Promise<string>} - The local path where image is saved
 */
const downloadImage = async (imageUrl, fileName) => {
  try {
    const uploadsDir = path.join(__dirname, '..', 'uploads', 'products');
    
    // Ensure directory exists
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const filePath = path.join(uploadsDir, fileName);
    
    // Check if file already exists
    if (fs.existsSync(filePath)) {
      console.log(`Image already exists: ${fileName}`);
      return `/uploads/products/${fileName}`;
    }

    // Download the image
    const response = await axios({
      method: 'GET',
      url: imageUrl,
      responseType: 'stream',
      timeout: 30000
    });

    // Save to file
    const writer = fs.createWriteStream(filePath);
    response.data.pipe(writer);

    return new Promise((resolve, reject) => {
      writer.on('finish', () => {
        console.log(`Image downloaded successfully: ${fileName}`);
        resolve(`/uploads/products/${fileName}`);
      });
      writer.on('error', (err) => {
        console.error(`Error saving image ${fileName}:`, err);
        reject(err);
      });
    });
  } catch (error) {
    console.error(`Error downloading image from ${imageUrl}:`, error.message);
    return null;
  }
};

/**
 * Get file extension from URL
 */
const getFileExtension = (url) => {
  const match = url.match(/\.(png|jpg|jpeg|gif|webp|PNG|JPG|JPEG|GIF|WEBP)(\?|$)/i);
  return match ? match[1].toLowerCase() : 'png';
};

/**
 * Generate safe filename from URL
 */
const generateFileName = (url, prefix = '') => {
  const ext = getFileExtension(url);
  const urlHash = Buffer.from(url).toString('base64').replace(/[^a-zA-Z0-9]/g, '').substring(0, 20);
  return `${prefix}${urlHash}.${ext}`;
};

/**
 * Clean up old unused images
 */
const cleanupUnusedImages = async (usedImages) => {
  try {
    const uploadsDir = path.join(__dirname, '..', 'uploads', 'products');
    
    if (!fs.existsSync(uploadsDir)) {
      return;
    }

    const files = fs.readdirSync(uploadsDir);
    
    files.forEach(file => {
      const filePath = `/uploads/products/${file}`;
      if (!usedImages.includes(filePath)) {
        const fullPath = path.join(uploadsDir, file);
        fs.unlinkSync(fullPath);
        console.log(`Deleted unused image: ${file}`);
      }
    });
  } catch (error) {
    console.error('Error cleaning up images:', error.message);
  }
};

module.exports = {
  downloadImage,
  getFileExtension,
  generateFileName,
  cleanupUnusedImages
};
