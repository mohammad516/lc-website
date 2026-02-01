/**
 * Utility functions for product-related operations
 */

/**
 * Checks if a sale is currently active for a product.
 * 
 * A sale is considered active if:
 * 1. enableSale is true
 * 2. salePrice exists and is a valid number
 * 3. saleEndDate either doesn't exist OR hasn't passed yet
 * 
 * @param product - Product object with sale fields
 * @param product.enableSale - Whether sale is enabled
 * @param product.salePrice - Sale price value
 * @param product.saleEndDate - Sale end date (can be Date, string, or null)
 * @returns true if sale is active, false otherwise
 */
export function isSaleActive(product: {
  enableSale?: boolean | null;
  salePrice?: number | null;
  saleEndDate?: Date | string | null;
}): boolean {
  // Sale must be enabled
  if (!product.enableSale) {
    return false;
  }

  // Sale price must exist and be a valid number
  if (!product.salePrice || typeof product.salePrice !== 'number' || product.salePrice <= 0) {
    return false;
  }

  // If no end date is set, sale is active (backward compatible)
  if (!product.saleEndDate) {
    return true;
  }

  // Check if sale end date has passed
  try {
    const endDate = typeof product.saleEndDate === 'string' 
      ? new Date(product.saleEndDate) 
      : product.saleEndDate;
    
    // Validate date
    if (isNaN(endDate.getTime())) {
      console.warn('Invalid saleEndDate format, treating as no expiration');
      return true; // Backward compatible: invalid date = no expiration
    }

    const now = new Date();
    
    // Sale is active if end date is in the future
    return endDate > now;
  } catch (error) {
    console.error('Error parsing saleEndDate:', error);
    // On error, default to no expiration (backward compatible)
    return true;
  }
}

/**
 * Gets the effective display price for a product.
 * Returns salePrice if sale is active, otherwise returns regular price.
 * 
 * @param product - Product object
 * @returns The price to display to the user
 */
export function getDisplayPrice(product: {
  price: number;
  enableSale?: boolean | null;
  salePrice?: number | null;
  saleEndDate?: Date | string | null;
}): number {
  const saleActive = isSaleActive({
    enableSale: product.enableSale,
    salePrice: product.salePrice,
    saleEndDate: product.saleEndDate,
  });

  return saleActive && product.salePrice ? product.salePrice : product.price;
}

/**
 * Gets the effective enableSale status.
 * Returns false if sale has expired, even if enableSale is true.
 * 
 * @param product - Product object
 * @returns Effective enableSale status
 */
export function getEffectiveEnableSale(product: {
  enableSale?: boolean | null;
  salePrice?: number | null;
  saleEndDate?: Date | string | null;
}): boolean {
  return isSaleActive(product);
}


