const cron = require('node-cron');
const { scrapeWesternUnionRate } = require('./exchangeRateScraper');
const fs = require('fs');
const path = require('path');

/**
 * Start exchange rate cron job
 * Runs every 10 minutes to fetch latest exchange rate
 */
function startExchangeRateCron() {
  // Run every 10 minutes: '*/10 * * * *'
  const task = cron.schedule('*/10 * * * *', async () => {
    try {
      console.log('\n⏰ [Cron Job] Fetching exchange rate...');
      
      const result = await scrapeWesternUnionRate();
      
      if (result.success) {
        // Save to cache directory
        const cacheDir = path.join(__dirname, '../cache');
        if (!fs.existsSync(cacheDir)) {
          fs.mkdirSync(cacheDir, { recursive: true });
        }
        
        const cacheFile = path.join(cacheDir, 'exchange-rate.json');
        fs.writeFileSync(cacheFile, JSON.stringify(result, null, 2));
        
        console.log(`✅ [Cron Job] Exchange rate updated: 1 USD = ${result.formattedRate} MMK`);
        console.log(`💾 [Cron Job] Saved to: ${cacheFile}`);
      } else {
        console.error('❌ [Cron Job] Failed to fetch exchange rate:', result.message || result.error);
      }
    } catch (error) {
      console.error('❌ [Cron Job] Error:', error.message);
    }
  });

  // Run immediately on startup
  (async () => {
    try {
      console.log('\n🚀 [Initial Run] Fetching exchange rate on startup...');
      
      const result = await scrapeWesternUnionRate();
      
      if (result.success) {
        const cacheDir = path.join(__dirname, '../cache');
        if (!fs.existsSync(cacheDir)) {
          fs.mkdirSync(cacheDir, { recursive: true });
        }
        
        const cacheFile = path.join(cacheDir, 'exchange-rate.json');
        fs.writeFileSync(cacheFile, JSON.stringify(result, null, 2));
        
        console.log(`✅ [Initial Run] Exchange rate: 1 USD = ${result.formattedRate} MMK`);
        console.log(`💾 [Initial Run] Saved to: ${cacheFile}`);
      } else {
        console.error('❌ [Initial Run] Failed to fetch exchange rate:', result.message || result.error);
      }
    } catch (error) {
      console.error('❌ [Initial Run] Error:', error.message);
    }
  })();

  console.log('✅ Exchange rate cron job started (runs every 10 minutes)');
  
  return task;
}

module.exports = { startExchangeRateCron };
