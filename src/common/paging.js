/**
 * Number of items that come before a page.
 *
 * @param {number} page page number, starting at 1 like pageNumbers
 * @param {number} pageSize items on each page
 * @returns {number} the offset to request from the API
 */
export const pageOffset = (page, pageSize) =>
  (Math.max(page, 1) - 1) * pageSize;

/**
 * Page numbers to show for a total, starting at 1.
 *
 * @param {number} total number of items
 * @param {number} pageSize items on each page
 * @returns {number[]} an empty list when one page holds everything
 */
export const pageNumbers = (total, pageSize) =>
  total <= pageSize
    ? []
    : [...Array(Math.ceil(total / pageSize)).keys()].map((e) => e + 1);
