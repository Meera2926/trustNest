/**
 * Standardized API Response Wrapper
 * All successful responses use this format
 */
class ApiResponse {
  constructor(statusCode, data, message = 'Success', pagination = null) {
    this.statusCode = statusCode;
    this.success = statusCode < 400;
    this.message = message;
    this.data = data;
    if (pagination) {
      this.pagination = pagination;
    }
    this.timestamp = new Date().toISOString();
  }
}

module.exports = ApiResponse;
