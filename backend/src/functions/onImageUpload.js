const admin = require("firebase-admin");
const path = require("path");
const os = require("os");
const fs = require("fs");

/**
 * Firebase Cloud Storage trigger function.
 * Resizes uploaded logos to 256x256 using Sharp and uploads them with long CDN cache headers.
 */
const optimizeLogoUpload = async (object) => {
  const filePath = object.name;

  if (!filePath.startsWith("company-logos/")) {
    return null;
  }

  if (object.metadata && object.metadata.optimized) {
    return null;
  }

  const bucket = admin.storage().bucket(object.bucket);
  const tempFilePath = path.join(os.tmpdir(), path.basename(filePath));
  const tempOptimizedPath = path.join(os.tmpdir(), `opt_${path.basename(filePath)}`);

  await bucket.file(filePath).download({ destination: tempFilePath });

  // Load sharp dynamically to mitigate function initialization cold start overheads
  const sharp = require("sharp");

  await sharp(tempFilePath)
    .resize(256, 256, { fit: "cover" })
    .jpeg({ quality: 75 })
    .toFile(tempOptimizedPath);

  await bucket.upload(tempOptimizedPath, {
    destination: filePath,
    metadata: {
      contentType: "image/jpeg",
      cacheControl: "public, max-age=31536000", // 1 year CDN cache
      metadata: {
        optimized: "true",
      },
    },
  });

  fs.unlinkSync(tempFilePath);
  fs.unlinkSync(tempOptimizedPath);

  console.log(`[Storage Trigger] Optimized company logo: ${filePath}`);
  return true;
};

module.exports = {
  optimizeLogoUpload,
};
