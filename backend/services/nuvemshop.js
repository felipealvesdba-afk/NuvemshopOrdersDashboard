const fetch = require('node-fetch');

class NuvemshopService {
  constructor() {
    this.baseUrl = `https://api.nuvemshop.com.br/v1/${process.env.STORE_ID}`;
    this.accessToken = process.env.NUVEMSHOP_TOKEN;
    this.cache = new Map();
    this.cacheExpiry = new Map();
  }

  /**
   * Get headers for Nuvemshop API requests
   */
  getHeaders() {
    return {
      'Authentication': `bearer ${this.accessToken}`,
      'x-api-key': process.env.NUVEMSHOP_API_KEY || '',
      'Content-Type': 'application/json'
    };
  }

  /**
   * Check if cached data is still valid
   */
  isCacheValid(key) {
    const expiry = this.cacheExpiry.get(key);
    if (!expiry) return false;
    return Date.now() < expiry;
  }

  /**
   * Set cache with expiry time
   */
  setCache(key, data, durationMinutes = 15) {
    this.cache.set(key, data);
    this.cacheExpiry.set(key, Date.now() + (durationMinutes * 60 * 1000));
  }

  /**
   * Get cached data if valid
   */
  getCache(key) {
    if (this.isCacheValid(key)) {
      return this.cache.get(key);
    }
    return null;
  }

  /**
   * Fetch orders from Nuvemshop API with pagination and filtering support
   */
  async fetchOrders(page = 1, perPage = 50, shipping_status = null) {
    const cacheKey = `orders_page_${page}_per_${perPage}_${shipping_status || ''}`;
    
    try {
      const cachedData = this.getCache(cacheKey);
      
      if (cachedData) {
        console.log(`Returning cached orders for page: ${page}, per_page: ${perPage}, shipping_status: ${shipping_status || ''}`);
        return cachedData;
      }

      // Build URL with pagination parameters (always fetch all orders)
      let url = `${this.baseUrl}/orders?page=${page}&per_page=${perPage}`;
      
      // Add shipping_status filter if specified
      if (shipping_status && shipping_status !== '' && shipping_status !== 'any') {
        if (shipping_status === 'unshipped') {
          url += `&shipping_status=unfulfilled`;
        } else if (shipping_status === 'shipped') {
          url += `&shipping_status=fulfilled`;
        } else if (shipping_status === 'unpacked') {
          url += `&shipping_status=unpacked`;
        } 
      } else {
        url += `&shipping_status=any`;
      }
      
      console.log(`Fetching from Nuvemshop API: ${url}`);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: this.getHeaders()
      });
      
      if (!response.ok) {
        if (response.status === 404) {
          console.warn(`Nuvemshop API returned 404 for store ${process.env.STORE_ID}. This might indicate:`);
          console.warn('- Invalid Store ID');
          console.warn('- Missing or invalid Nuvemshop Token');
          console.warn('- Store is inactive or doesn\'t exist');
          console.warn('- API endpoint structure has changed');
        }
        throw new Error(`Nuvemshop API error: ${response.status} ${response.statusText}`);
      }

      const orders = await response.json();
      
      // Get total count from x-total-count header
      const totalCount = parseInt(response.headers.get('x-total-count')) || orders.length;
      const totalPages = Math.ceil(totalCount / perPage);
      
      console.log(`Nuvemshop API response - Total count: ${totalCount}, Total pages: ${totalPages}, Current page: ${page}`);
      
      // Process orders to add computed fields
      let processedOrders = orders.map(order => {
        const processed = this.processOrder(order);
        return processed;
      });
      
      // Note: No need for post-processing filter since we filter at API level
      // The API already returns the correct orders based on Nuvemshop's status mapping
      
      const result = {
        orders: processedOrders,
        totalCount: totalCount, // Use original API count
        totalPages: totalPages,  // Use original API pages
        currentPage: page,
        perPage: perPage
      };
      
      // Cache the results
      this.setCache(cacheKey, result);
      
      return result;

    } catch (error) {
      console.error('Error fetching orders from Nuvemshop:', error.message);
      
      // Return empty result structure when API fails
      console.warn('API failed, returning empty orders result');
      const emptyResult = {
        orders: [],
        totalCount: 0,
        totalPages: 0,
        currentPage: page,
        perPage: perPage
      };
      
      // Cache empty result for shorter duration
      this.setCache(cacheKey, emptyResult, 5); // 5 minutes cache for empty result
      return emptyResult;
    }
  }

  /**
   * Fetch a single order by ID (currently using mock data)
   */
  async fetchOrderById(orderId) {
    const cacheKey = `order_${orderId}`;
    
    try {
      const cachedData = this.getCache(cacheKey);
      
      if (cachedData) {
        console.log(`Returning cached order: ${orderId}`);
        return cachedData;
      }

      // Use real Nuvemshop API
      console.log(`Fetching order ${orderId} from Nuvemshop API...`);
      const url = `${this.baseUrl}/orders/${orderId}`;
      console.log(`Fetching order ${orderId} from Nuvemshop API: ${url}`);

      const response = await fetch(url, {
        method: 'GET',
        headers: this.getHeaders()
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error(`Order ${orderId} not found`);
        }
        throw new Error(`Nuvemshop API error: ${response.status} ${response.statusText}`);
      }

      const order = await response.json();
      const processedOrder = this.processOrder(order);
      
      // Cache the result
      this.setCache(cacheKey, processedOrder);
      
      console.log(`Successfully fetched order: ${orderId} from Nuvemshop API`);
      return processedOrder;

    } catch (error) {
      console.error(`Error fetching order ${orderId}:`, error.message);
      
      // Return null when order not found or API fails
      console.warn(`Order ${orderId} not found or API failed`);
      return null;
    }
  }

  /**
   * Process order data to add computed fields
   */
  processOrder(order) {
    // Map Nuvemshop API status to our expected status
    const mappedStatus = this.mapOrderStatus(order);
    
    const processedOrder = {
      id: order.id,
      customer_name: this.getCustomerName(order),
      order_date: order.created_at,
      shipping_status: mappedStatus,
      days_in_ready_to_pack: 0,
      is_delayed: false,
      // Include all original order data
      ...order
    };

    // Calculate days in unpacked status
    if (mappedStatus === 'unpacked' && order.created_at) {
      const orderDate = new Date(order.created_at);
      const now = new Date();
      const daysDiff = Math.floor((now - orderDate) / (1000 * 60 * 60 * 24));
      
      processedOrder.days_in_ready_to_pack = daysDiff;
      processedOrder.is_delayed = daysDiff > 3;
    }

    return processedOrder;
  }

  /**
   * Map Nuvemshop API status to our expected shipping status
   */
  mapOrderStatus(order) {
    // Nuvemshop API uses different status fields
    const shippingStatus = order.shipping_status; // "unfulfilled", "fulfilled", "unpacked"
    const mainStatus = order.status; // "open", "closed", "cancelled"

    // console.log(`Mapping order ${order.id}: shippingStatus=${shippingStatus}, mainStatus=${mainStatus}`);

    // Map Nuvemshop's special statuses to our values
    if (shippingStatus === 'unfulfilled') {
      return 'unshipped';
    } else if (shippingStatus === 'fulfilled') {
      return 'shipped';
    } else if (shippingStatus === 'unpacked') {
      return 'unpacked';
    }

    // Default fallback - return shipping status if available, otherwise main status
    return shippingStatus || mainStatus;
  }

  /**
   * Extract customer name from order data
   */
  getCustomerName(order) {
    if (order.customer) {
      // Nuvemshop API has customer.name directly
      if (order.customer.name) {
        return order.customer.name;
      }
      // Fallback to first_name and last_name if available
      if (order.customer.first_name && order.customer.last_name) {
        return `${order.customer.first_name} ${order.customer.last_name}`;
      }
      return order.customer.first_name || order.customer.last_name || 'Unknown Customer';
    }
    return 'Unknown Customer';
  }

  /**
   * Clear cache for specific key or all cache
   */
  clearCache(key = null) {
    if (key) {
      this.cache.delete(key);
      this.cacheExpiry.delete(key);
      console.log(`Cleared cache for key: ${key}`);
    } else {
      this.cache.clear();
      this.cacheExpiry.clear();
      console.log('Cleared all cache');
    }
  }

  /**
   * Get cache statistics
   */
  getCacheStats() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
      expiryTimes: Array.from(this.cacheExpiry.entries())
    };
  }
}

module.exports = new NuvemshopService();
