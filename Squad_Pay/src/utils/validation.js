function requireFields(body, fields) {
  const missing = fields.filter((f) => body[f] === undefined || body[f] === null);
  if (missing.length) {
    const err = new Error(`Missing required fields: ${missing.join(", ")}`);
    err.status = 400;
    throw err;
  }
}

module.exports = { requireFields };
