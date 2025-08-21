export default function errorHandler(err, req, res, _next) {
    // eslint-disable-next-line no-console
    console.error('Error:', err);
    const status = err.status || 500;
    const message = err.message || 'Internal Server Error';
    res.status(status).json({ error: message });
  }
  
  
  