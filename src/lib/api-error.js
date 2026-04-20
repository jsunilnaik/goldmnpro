import { NextResponse } from 'next/server';

/**
 * Standardized API Error Handler
 * @param {Error} error - The error object caught in the catch block
 * @param {string} customLoggerPrefix - Optional prefix for the console.error log
 */
export function handleApiError(error, customLoggerPrefix = 'API Error') {
  console.error(`${customLoggerPrefix}:`, error);

  const message = error.message || 'Internal server error';
  
  // Map specific error messages to HTTP status codes
  let status = 500;
  
  if (message.includes('Unauthorized') || message.includes('Authentication required')) {
    status = 401;
  } else if (message.includes('Forbidden') || message.includes('Admin access required')) {
    status = 403;
  } else if (message.includes('not found') || message.includes('Not Found')) {
    status = 404;
  } else if (message.includes('Validation failed') || message.includes('Invalid input')) {
    status = 400;
  } else if (message.includes('already exists')) {
    status = 409;
  }

  return NextResponse.json(
    { 
      message: status === 500 ? 'An unexpected error occurred' : message,
      error: process.env.NODE_ENV === 'development' ? message : undefined
    },
    { status }
  );
}

/**
 * Custom Error class for API specific errors
 */
export class ApiError extends Error {
  constructor(message, status = 400) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}
