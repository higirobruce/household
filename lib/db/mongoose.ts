import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  // Don't throw at import time — surfaced at first use to allow build without env.
  console.warn("[db] MONGODB_URI not set");
}

declare global {
  // eslint-disable-next-line no-var
  var __mongoose:
    | { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null }
    | undefined;
}

const cached = (global.__mongoose ??= { conn: null, promise: null });

export async function connectDb() {
  if (cached.conn) return cached.conn;
  if (!MONGODB_URI) throw new Error("MONGODB_URI is not configured");
  if (!cached.promise) {
    cached.promise = mongoose
      .connect(MONGODB_URI, {
        bufferCommands: false,
        maxPoolSize: 10,
      })
      .then((m) => m);
  }
  cached.conn = await cached.promise;
  return cached.conn;
}
