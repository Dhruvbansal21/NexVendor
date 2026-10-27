/**
 * Helper to resolve MongoDB connection URIs for both Cloud (MongoDB Atlas)
 * and Local instances.
 *
 * Priority:
 * 1. Dedicated Service Environment Variable (e.g. MONGO_URI_AUTH)
 * 2. Shared Cluster URI (MONGODB_URI or MONGO_URI) with target database path injected
 * 3. Local fallback (mongodb://127.0.0.1:27017/<databaseName>)
 */
export function getMongoUri(serviceEnvVar, dbName) {
  if (serviceEnvVar && process.env[serviceEnvVar]) {
    return process.env[serviceEnvVar];
  }

  const baseUri = process.env.MONGODB_URI || process.env.MONGO_URI;
  if (baseUri) {
    try {
      const parsed = new URL(baseUri);
      parsed.pathname = `/${dbName}`;
      return parsed.toString();
    } catch {
      // Fallback for URIs that might have unencoded characters in credentials
      if (baseUri.includes('?')) {
        return baseUri.replace(/\/([^/?]*)(\?.*)$/, `/${dbName}$2`);
      }
      return `${baseUri.replace(/\/+$/, '')}/${dbName}`;
    }
  }

  return `mongodb://127.0.0.1:27017/${dbName}`;
}

/**
 * Masks user credentials from MongoDB connection string for safe log outputs.
 */
export function sanitizeMongoUri(uri) {
  if (!uri || typeof uri !== 'string') return '';
  try {
    const parsed = new URL(uri);
    if (parsed.password) {
      parsed.password = '****';
    }
    return parsed.toString();
  } catch {
    return uri.replace(/:([^:@/]+)@/, ':****@');
  }
}

/**
 * Standard Mongoose connection options optimized for both MongoDB Atlas Cloud
 * and Local Docker instances.
 */
export function getMongoOptions(customOptions = {}) {
  return {
    serverSelectionTimeoutMS: 10000,
    connectTimeoutMS: 10000,
    ...customOptions
  };
}
