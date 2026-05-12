// Catches any unhandled errors and returns a clean JSON response

function errorHandler(err, req, res, next) {
  console.error('Unhandled error:', err);
  res.status(500).json({
    success: false,
    error: 'INTERNAL_ERROR',
    message: 'Something went wrong. Please try again.'
  });
}

module.exports = errorHandler;
