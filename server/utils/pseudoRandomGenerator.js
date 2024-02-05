// Reference: https://nodejs.org/api/crypto.html#cryptorandombytessize-callback
// Synchronous
const { randomBytes } = await import("node:crypto");

export const pseudoRandomToken = (length) => randomBytes(length).toString("hex");
