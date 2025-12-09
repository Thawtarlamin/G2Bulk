const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

/**
 * Scrape USD to MMK exchange rate from Western Union using Puppeteer
 * @returns {Promise<Object>} Exchange rate data
 */
async function scrapeWesternUnionRate() {
  let browser;
  
  try {
    browser = await puppeteer.launch({
      headless: 'new',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--disable-gpu'
      ]
    });
    
    const page = await browser.newPage();
    
    // Set viewport and user agent
    await page.setViewport({ width: 1920, height: 1080 });
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    
    const url = 'https://www.westernunion.com/us/en/currency-converter/usd-to-mmk-rate.html';
    
    await page.goto(url, {
      waitUntil: 'networkidle2',
      timeout: 30000
    });
    
    // Wait for page to fully render
    await new Promise(resolve => setTimeout(resolve, 10000));
    
    // Try multiple selectors to find the exchange rate
    const selectors = [
      '[data-testid="exchange-rate"]',
      '[data-testid="rate"]',
      '.exchange-rate',
      '.currency-rate',
      '[class*="rate"]',
      '[class*="exchange"]',
      'span[class*="rate"]',
      'div[class*="rate"]'
    ];
    
    let rateFound = null;
    
    // Method 1: Try specific selectors
    for (const selector of selectors) {
      try {
        const element = await page.$(selector);
        if (element) {
          const text = await page.evaluate(el => el.textContent, element);
          
          const match = text.match(/([\d,]+\.?\d*)\s*MMK/i);
          if (match) {
            rateFound = match[1].replace(/,/g, '');
            break;
          }
        }
      } catch (e) {
        // Continue to next selector
      }
    }
    
    // Method 2: Search entire page content
    if (!rateFound) {
      const pageContent = await page.evaluate(() => document.body.innerText);
      
      // Pattern: "FX: 1.00 USD – 3993.9600 MMK" (Western Union format)
      const pattern3 = /FX:\s*[\d.]+\s*USD\s*[–-]\s*([\d,]+\.?\d*)\s*MMK/i;
      const match3 = pageContent.match(pattern3);
      
      // Pattern: "1 USD = 2,100.00 MMK"
      const pattern1 = /1\s*USD\s*=\s*([\d,]+\.?\d*)\s*MMK/i;
      const match1 = pageContent.match(pattern1);
      
      if (match3) {
        rateFound = match3[1].replace(/,/g, '');
      } else if (match1) {
        rateFound = match1[1].replace(/,/g, '');
      } else {
        // Pattern: Any number followed by MMK
        const pattern2 = /([\d,]+\.\d{2})\s*MMK/i;
        const matches = pageContent.match(new RegExp(pattern2, 'gi'));
        
        if (matches && matches.length > 0) {
          // Take the first one that looks like a reasonable MMK rate (1000-10000)
          for (const match of matches) {
            const numMatch = match.match(/([\d,]+\.\d{2})/);
            if (numMatch) {
              const num = parseFloat(numMatch[1].replace(/,/g, ''));
              if (num > 1000 && num < 10000) {
                rateFound = num.toString();
                break;
              }
            }
          }
        }
      }
    }
    
    // Method 3: Look for input fields with rate values
    if (!rateFound) {
      const inputs = await page.$$('input[type="text"], input[type="number"]');
      for (const input of inputs) {
        const value = await page.evaluate(el => el.value, input);
        const placeholder = await page.evaluate(el => el.placeholder, input);
        
        if (value || placeholder) {
          const numValue = parseFloat((value || placeholder).replace(/,/g, ''));
          if (numValue > 1000 && numValue < 10000) {
            rateFound = numValue.toString();
            break;
          }
        }
      }
    }
    
    await browser.close();
    
    let result;
    
    if (rateFound) {
      const rate = parseFloat(rateFound);
      result = {
        success: true,
        rate: rate,
        formattedRate: rate.toLocaleString('en-US', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        }),
        currency: 'USD to MMK',
        source: 'Western Union',
        timestamp: new Date().toISOString(),
        url: url
      };
    } else {
      result = {
        success: false,
        message: 'Could not find exchange rate on the page'
      };
    }
    
    return result;
    
  } catch (error) {
    if (browser) {
      await browser.close();
    }
    
    return {
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
}

/**
 * Get exchange rate with caching support
 * @param {number} cacheDuration - Cache duration in minutes (default: 60)
 * @returns {Promise<Object>} Exchange rate data
 */
async function getExchangeRate(cacheDuration = 60) {
  const cacheDir = path.join(__dirname, '../cache');
  const cacheFile = path.join(cacheDir, 'exchange-rate.json');
  
  // Create cache directory if it doesn't exist
  if (!fs.existsSync(cacheDir)) {
    fs.mkdirSync(cacheDir, { recursive: true });
  }
  
  // Check if cache file exists and is still valid
  if (fs.existsSync(cacheFile)) {
    const cacheData = JSON.parse(fs.readFileSync(cacheFile, 'utf8'));
    const cacheTime = new Date(cacheData.timestamp);
    const now = new Date();
    const diffMinutes = (now - cacheTime) / (1000 * 60);
    
    if (diffMinutes < cacheDuration && cacheData.success) {
      console.log(`📦 Using cached exchange rate (${Math.round(diffMinutes)} minutes old)`);
      return cacheData;
    }
  }
  
  // Fetch fresh data
  console.log('🔄 Fetching fresh exchange rate...');
  const result = await scrapeWesternUnionRate();
  
  // Save to cache
  if (result.success) {
    fs.writeFileSync(cacheFile, JSON.stringify(result, null, 2));
    console.log('💾 Exchange rate cached successfully');
  }
  
  return result;
}

module.exports = {
  scrapeWesternUnionRate,
  getExchangeRate
};
