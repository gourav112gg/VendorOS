const { z } = require("zod");

// String sanitization helper: strips script tags, other HTML tags, and ASCII control characters.
const sanitizeString = (val) => {
  if (typeof val !== "string") return val;
  return val
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "") // Remove <script> blocks
    .replace(/<[^>]*>/g, "") // Strip HTML tags
    .replace(/[\x00-\x1F\x7F]/g, "") // Strip control characters
    .trim();
};

// Zod schemas with custom preprocessors to automatically sanitize and normalize strings
const emailSchema = z.preprocess(
  (val) => {
    const sanitized = sanitizeString(val);
    return typeof sanitized === "string" ? sanitized.toLowerCase().trim() : sanitized;
  },
  z.string().email().max(100)
);
const passwordSchema = z.preprocess(sanitizeString, z.string().min(6).max(50));
const nameSchema = z.preprocess(sanitizeString, z.string().min(2).max(50));
const phoneSchema = z.preprocess(sanitizeString, z.string().max(20).optional().or(z.literal("")));
const companyNameSchema = z.preprocess(sanitizeString, z.string().min(2).max(100));
const tokenSchema = z.preprocess(sanitizeString, z.string().min(10));
const roleSchema = z.preprocess(sanitizeString, z.enum(["owner", "manager", "worker", "customer"]));

const loginSchema = z.object({
  idToken: tokenSchema,
  email: emailSchema,
  category: z.preprocess(sanitizeString, z.enum(["owner", "vendor", "customer"]))
});

const ownerSignupSchema = z.object({
  idToken: tokenSchema,
  name: nameSchema,
  email: emailSchema,
  phone: phoneSchema,
  companyName: companyNameSchema
});

const customerSignupSchema = z.object({
  idToken: tokenSchema,
  name: nameSchema,
  email: emailSchema,
  phone: phoneSchema
});

const managerWorkerCreateSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  phone: phoneSchema,
  password: passwordSchema,
  role: z.preprocess(sanitizeString, z.enum(["manager", "worker"]))
});

const vendorSignupSchema = z.object({
  idToken: tokenSchema,
  name: nameSchema,
  email: emailSchema,
  phone: phoneSchema,
  companyId: z.preprocess(sanitizeString, z.string().min(1)),
  role: z.preprocess(sanitizeString, z.enum(["Manager", "Worker"]))
});

// Middleware factory generator
const validateSchema = (schema) => {
  return (req, res, next) => {
    try {
      // Parse & sanitize request body
      req.body = schema.parse(req.body);
      next();
    } catch (err) {
      if (err instanceof z.ZodError) {
        // Log details internally (avoiding secrets logging)
        console.warn("[Validation Failure] Route:", req.originalUrl, "Issues:", 
          err.issues.map(i => ({ path: i.path, code: i.code }))
        );
      } else {
        console.error("[Validation Error]", err);
      }

      // Return identical generic response to prevent information leakage
      return res.status(400).json({
        success: false,
        message: "Invalid request"
      });
    };
  };
};

module.exports = {
  validateSchema,
  loginSchema,
  ownerSignupSchema,
  customerSignupSchema,
  vendorSignupSchema,
  managerWorkerCreateSchema
};
