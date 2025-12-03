const axios = require('axios');

const BASE_URL = process.env.PROVIDER_BASE_URL || 'https://api.g2bulk.com/v1/';
const API_KEY = process.env.PROVIDER_API_KEY || '';

const client = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'X-API-Key': API_KEY
  },
  timeout: 10000
});

async function getMe() {
  try {
    const res = await client.get('/getMe');
    return res.data;
  } catch (error) {
    if (error.response) {
      const err = new Error(`G2Bulk API error: ${error.response.status}`);
      err.response = error.response.data;
      err.status = error.response.status;
      throw err;
    }
    throw error;
  }
}

async function checkPlayerId({ game, user_id, server_id }) {
  try {
    const res = await client.post('/games/checkPlayerId', {
      game,
      user_id,
      server_id
    });
    return res.data;
  } catch (error) {
    if (error.response) {
      const err = new Error(`G2Bulk API error: ${error.response.status}`);
      err.response = error.response.data;
      err.status = error.response.status;
      throw err;
    }
    throw error;
  }
}

// Place an order for a game. `code` is the game code (e.g. 'pubgm').
// `payload` should contain: catalogue_name, player_id, server_id, remark, callback_url
async function placeOrder(code, payload) {
  const path = `/games/${encodeURIComponent(code)}/order`;
  try {
    const res = await client.post(path, payload);
    return res.data;
  } catch (error) {
    // Retry once on timeout or network error
    if (!error.response || error.code === 'ECONNABORTED') {
      try {
        const retryRes = await client.post(path, payload);
        return retryRes.data;
      } catch (retryError) {
        if (retryError.response) {
          const err = new Error(`G2Bulk API error: ${retryError.response.status}`);
          err.response = retryError.response.data;
          err.status = retryError.response.status;
          throw err;
        }
        throw retryError;
      }
    }

    if (error.response) {
      const err = new Error(`G2Bulk API error: ${error.response.status}`);
      err.response = error.response.data;
      err.status = error.response.status;
      throw err;
    }
    throw error;
  }
}

// Check order status for a given order_id and game
async function getOrderStatus({ order_id, game }) {
  try {
    const res = await client.post('/games/order/status', { order_id, game });
    return res.data;
  } catch (error) {
    if (error.response) {
      const err = new Error(`G2Bulk API error: ${error.response.status}`);
      err.response = error.response.data;
      err.status = error.response.status;
      throw err;
    }
    throw error;
  }
}

// List all orders for the authenticated API user
async function listOrders() {
  try {
    const res = await client.get('/games/orders');
    return res.data;
  } catch (error) {
    if (error.response) {
      const err = new Error(`G2Bulk API error: ${error.response.status}`);
      err.response = error.response.data;
      err.status = error.response.status;
      throw err;
    }
    throw error;
  }
}

// Purchase a product by ID. `payload` should contain: { quantity }
async function purchaseProduct(productId, payload) {
  const path = `/products/${encodeURIComponent(productId)}/purchase`;
  try {
    const res = await client.post(path, payload);
    return res.data;
  } catch (error) {
    // Retry once on timeout or network error
    if (!error.response || error.code === 'ECONNABORTED') {
      try {
        const retryRes = await client.post(path, payload);
        return retryRes.data;
      } catch (retryError) {
        if (retryError.response) {
          const err = new Error(`G2Bulk API error: ${retryError.response.status}`);
          err.response = retryError.response.data;
          err.status = retryError.response.status;
          throw err;
        }
        throw retryError;
      }
    }

    if (error.response) {
      const err = new Error(`G2Bulk API error: ${error.response.status}`);
      err.response = error.response.data;
      err.status = error.response.status;
      throw err;
    }
    throw error;
  }
}

module.exports = {
  client,
  getMe,
  checkPlayerId
  ,
  placeOrder
  ,
  getOrderStatus,
  listOrders
  ,
  purchaseProduct
};
