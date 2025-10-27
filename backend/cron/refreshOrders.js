const cron = require('node-cron');
const nuvemshopService = require('../services/nuvemshop');

class OrderRefreshScheduler {
  constructor() {
    this.isRunning = false;
    this.lastRefresh = null;
    this.refreshInterval = process.env.CACHE_DURATION || 15; // minutes
  }

  /**
   * Start the cron job for automatic order refresh
   */
  start() {
    if (this.isRunning) {
      console.log('Order refresh scheduler is already running');
      return;
    }

    // Schedule refresh every 10-15 minutes (configurable)
    const cronExpression = `*/${this.refreshInterval} * * * *`;
    
    console.log(`Starting order refresh scheduler with cron: ${cronExpression}`);
    console.log(`Orders will be refreshed every ${this.refreshInterval} minutes`);

    cron.schedule(cronExpression, async () => {
      await this.refreshOrders();
    }, {
      scheduled: true,
      timezone: "America/Sao_Paulo" // Brazilian timezone
    });

    this.isRunning = true;
    
    // Perform initial refresh
    this.refreshOrders();
  }

  /**
   * Stop the cron job
   */
  stop() {
    if (!this.isRunning) {
      console.log('Order refresh scheduler is not running');
      return;
    }

    cron.destroy();
    this.isRunning = false;
    console.log('Order refresh scheduler stopped');
  }

  /**
   * Manually refresh orders data
   */
  async refreshOrders() {
    try {
      console.log('Starting scheduled order refresh (using real Nuvemshop API)...');
      const startTime = Date.now();

      // Clear existing cache to force fresh data
      nuvemshopService.clearCache();

      // Fetch fresh data from Nuvemshop API (all orders)
      const allOrders = await nuvemshopService.fetchOrders(1, 50);

      const totalOrders = allOrders.orders.length;
      const duration = Date.now() - startTime;

      this.lastRefresh = new Date();
      
      console.log(`Order refresh completed successfully (real Nuvemshop API):`);
      console.log(`- Total orders fetched: ${totalOrders}`);
      console.log(`- Duration: ${duration}ms`);
      console.log(`- Next refresh in: ${this.refreshInterval} minutes`);

      // Log any delayed orders
      const delayedOrders = allOrders.orders.filter(order => order.is_delayed);
      if (delayedOrders.length > 0) {
        console.log(`⚠️  Found ${delayedOrders.length} delayed orders:`);
        delayedOrders.forEach(order => {
          console.log(`   - Order ${order.id}: ${order.days_in_ready_to_pack} days in ready_to_pack`);
        });
      }

    } catch (error) {
      console.error('Error during scheduled order refresh:', error.message);
      
      // Log error details for debugging
      console.error('Error stack:', error.stack);
      
      // The service will now use mock data as fallback, so we can continue
      console.log('Order refresh will use mock data as fallback');
      
      // Don't throw the error to prevent cron job from stopping
      // The next scheduled run will try again
    }
  }

  /**
   * Get scheduler status
   */
  getStatus() {
    return {
      isRunning: this.isRunning,
      lastRefresh: this.lastRefresh,
      refreshInterval: this.refreshInterval,
      nextRefresh: this.lastRefresh ? 
        new Date(this.lastRefresh.getTime() + (this.refreshInterval * 60 * 1000)) : 
        null,
      cacheStats: nuvemshopService.getCacheStats()
    };
  }

  /**
   * Force immediate refresh (for manual triggers)
   */
  async forceRefresh() {
    console.log('Manual order refresh triggered...');
    await this.refreshOrders();
  }

  /**
   * Update refresh interval
   */
  updateInterval(newIntervalMinutes) {
    if (newIntervalMinutes < 5 || newIntervalMinutes > 60) {
      throw new Error('Refresh interval must be between 5 and 60 minutes');
    }

    this.refreshInterval = newIntervalMinutes;
    
    if (this.isRunning) {
      // Restart scheduler with new interval
      this.stop();
      this.start();
    }
    
    console.log(`Refresh interval updated to ${newIntervalMinutes} minutes`);
  }
}

module.exports = new OrderRefreshScheduler();
