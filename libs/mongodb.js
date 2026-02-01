import { MongoClient } from 'mongodb';

const uri = process.env.DATABASE_URL;
const options = {};

let client;
let clientPromise;

if (!process.env.DATABASE_URL) {
  throw new Error('Please add your Mongo URI to the .env file');
}

if (process.env.NODE_ENV === 'development') {
  // In development mode, use a global variable so that the value
  // is preserved across module reloads caused by HMR (Hot Module Replacement).
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  // In production mode, it's best to not use a global variable.
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

// Export a module-scoped MongoClient promise. By doing this in a
// separate module, the client can be shared across functions.
export default clientPromise;

// Export a function to get the client
export async function getClient() {
  return await clientPromise;
}

// Export a function to get the database
export async function getDb() {
  const client = await clientPromise;
  
  // Extract database name from DATABASE_URL if not set
  let dbName = process.env.MONGODB_DB;
  
  if (!dbName && process.env.DATABASE_URL) {
    // Extract from URL: mongodb+srv://user:pass@host/dbname?params
    const urlParts = process.env.DATABASE_URL.split('?')[0].split('/');
    if (urlParts.length > 0) {
      dbName = urlParts[urlParts.length - 1];
    }
  }
  
  dbName = dbName || 'lcorganic'; // default to lcorganic
  
  return client.db(dbName);
}




