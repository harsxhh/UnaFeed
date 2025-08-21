export function assert(condition, message, status = 400) {
    if (!condition) {
      const err = new Error(message || 'Bad Request');
      err.status = status;
      throw err;
    }
  }
  
  
  