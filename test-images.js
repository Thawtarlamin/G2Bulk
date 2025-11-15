// Test file to verify image mapping logic
const { getItemImage, getGameImage, extractNumericValue } = require('./utils/productImageMapper');

// Test cases
console.log('=== Testing Image Mapping Logic ===\n');

// Test Mobile Legends
console.log('Mobile Legends Tests:');
console.log('Game Image:', getGameImage('mobile-legends-global'));
console.log('5 Diamonds:', getItemImage('mobile-legends-global', '5 Diamonds'));
console.log('22 Diamonds:', getItemImage('mobile-legends-global', '22 Diamonds'));
console.log('56 Diamonds:', getItemImage('mobile-legends-global', '56 Diamonds'));
console.log('112 Diamonds:', getItemImage('mobile-legends-global', '112 Diamonds'));
console.log('1000 Diamonds:', getItemImage('mobile-legends-global', '1000 Diamonds'));
console.log('Twilight Pass:', getItemImage('mobile-legends-global', 'Twilight Pass'));
console.log('Weekly Diamond Pass:', getItemImage('mobile-legends-global', 'Weekly Diamond Pass'));

console.log('\n');

// Test Magic Chess
console.log('Magic Chess Go Go Tests:');
console.log('Game Image:', getGameImage('magicchess-go-go'));
console.log('5 Diamonds:', getItemImage('magicchess-go-go', '5 Diamonds'));
console.log('20 Diamonds:', getItemImage('magicchess-go-go', '20 Diamonds'));
console.log('56 Diamonds:', getItemImage('magicchess-go-go', '56 Diamonds'));
console.log('Battle for Discounts:', getItemImage('magicchess-go-go', 'Battle for Discounts'));
console.log('Weekly Pass:', getItemImage('magicchess-go-go', 'Weekly Pass'));

console.log('\n');

// Test PUBG Mobile
console.log('PUBG Mobile Tests:');
console.log('Game Image:', getGameImage('pubg-mobile-global'));
console.log('60 UC:', getItemImage('pubg-mobile-global', '60 UC'));
console.log('300 UC:', getItemImage('pubg-mobile-global', '300 UC'));
console.log('1500 UC:', getItemImage('pubg-mobile-global', '1500 UC'));

console.log('\n');

// Test Honor of Kings
console.log('Honor of Kings Tests:');
console.log('Game Image:', getGameImage('honor-of-kings-global'));
console.log('16 Tokens:', getItemImage('honor-of-kings-global', '16 Tokens'));
console.log('50 Tokens:', getItemImage('honor-of-kings-global', '50 Tokens'));
console.log('300 Tokens:', getItemImage('honor-of-kings-global', '300 Tokens'));
console.log('1500 Tokens:', getItemImage('honor-of-kings-global', '1500 Tokens'));

console.log('\n');

// Test Free Fire
console.log('Free Fire Tests:');
console.log('Game Image:', getGameImage('free-fire-v1'));
console.log('5 Diamonds:', getItemImage('free-fire-v1', '5 Diamonds'));
console.log('100 Diamonds:', getItemImage('free-fire-v1', '100 Diamonds'));
console.log('Game Image (i):', getGameImage('free-fire-i'));

console.log('\n');

// Test numeric extraction
console.log('Numeric Value Extraction Tests:');
console.log('5 Diamonds:', extractNumericValue('5 Diamonds'));
console.log('1000 Diamonds:', extractNumericValue('1000 Diamonds'));
console.log('Weekly Pass:', extractNumericValue('Weekly Pass'));
console.log('60 + 6 UC:', extractNumericValue('60 + 6 UC'));

console.log('\n=== Tests Complete ===');
