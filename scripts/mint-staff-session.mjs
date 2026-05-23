import { config } from "dotenv";
config({ path: ".env.local" });
import { SignJWT } from "jose";
import mongoose from "mongoose";

const { MONGODB_URI, SESSION_SECRET } = process.env;
await mongoose.connect(MONGODB_URI);
const staff = await mongoose.connection.db
  .collection("users")
  .findOne({ email: "staff@example.com" });
const membership = await mongoose.connection.db
  .collection("householdmemberships")
  .findOne({ userId: staff._id });
const token = await new SignJWT({
  userId: String(staff._id),
  householdId: String(membership.householdId),
})
  .setProtectedHeader({ alg: "HS256" })
  .setIssuedAt()
  .setExpirationTime("30d")
  .sign(new TextEncoder().encode(SESSION_SECRET));
console.log(token);
await mongoose.disconnect();
