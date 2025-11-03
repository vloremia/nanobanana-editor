/**
 * Simple rate limiter to prevent API spam
 */
export class RateLimiter {
  private lastCallTime: number = 0;
  private minInterval: number;

  constructor(minIntervalMs: number = 2000) {
    this.minInterval = minIntervalMs;
  }

  /**
   * Check if enough time has passed since the last call
   * @returns true if the action can proceed, false if rate limited
   */
  canProceed(): boolean {
    const now = Date.now();
    const timeSinceLastCall = now - this.lastCallTime;
    
    if (timeSinceLastCall >= this.minInterval) {
      this.lastCallTime = now;
      return true;
    }
    
    return false;
  }

  /**
   * Get remaining time until next allowed call in seconds
   */
  getRemainingTime(): number {
    const now = Date.now();
    const timeSinceLastCall = now - this.lastCallTime;
    const remaining = Math.max(0, this.minInterval - timeSinceLastCall);
    return Math.ceil(remaining / 1000);
  }

  /**
   * Reset the rate limiter
   */
  reset(): void {
    this.lastCallTime = 0;
  }
}

// Create singleton instances for different operations
export const generateRateLimiter = new RateLimiter(3000); // 3 seconds between generations
export const editRateLimiter = new RateLimiter(3000); // 3 seconds between edits

