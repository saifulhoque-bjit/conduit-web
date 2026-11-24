/**
 * Number of items that come before a page.
 *
 * @param {number} pageIndex zero-based index of the page
 * @param {number} pageSize items on each page
 * @returns {number} the offset to request from the API
 */
export const pageOffset = (pageIndex, pageSize) =>
  Math.max(pageIndex, 0) * pageSize;

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
