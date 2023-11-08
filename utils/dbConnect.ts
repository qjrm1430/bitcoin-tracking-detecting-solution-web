import mongoose, { Connection } from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_ID = process.env.MONGODB_ID;
const MONGODB_PW = process.env.MONGODB_PW;
if (!MONGODB_URI) {
  throw new Error(
    "Please define the MONGODB_URI environment variable inside .env.local",
  );
}
if (!MONGODB_ID || !MONGODB_PW) {
  throw new Error(
    "Please define the MONGODB_ID OR MONGODB_PW environment variable inside .env.local",
  );
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function dbConnect() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise && MONGODB_URI) {
    const opts = {
      bufferCommands: false,
      authSource: "admin",
      user: MONGODB_ID,
      pass: MONGODB_PW,
      useNewUrlParser: true,
      useUnifiedTopology: true,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      return mongoose;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export default dbConnect;
