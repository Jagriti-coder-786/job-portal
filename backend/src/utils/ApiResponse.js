class ApiResponse {
  constructor(statusCode, message, data = null) {
    this.success = statusCode < 400;
    this.message = message;
    this.data = data;
  }

  static success(message, data) {
    return new ApiResponse(200, message, data);
  }

  static created(message, data) {
    return new ApiResponse(201, message, data);
  }
}

export default ApiResponse;
