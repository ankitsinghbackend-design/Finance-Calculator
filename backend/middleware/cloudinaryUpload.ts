import multer, { MulterError } from "multer"
import { CloudinaryStorage } from "multer-storage-cloudinary"
import { getCloudinary } from "../config/cloudinary"
import { Request, Response, NextFunction } from "express"

// ── Constants ──────────────────────────────────────────────

/** Maximum upload size: 5 MB */
const MAX_FILE_SIZE = 5 * 1024 * 1024

/** Allowed MIME types for image uploads */
const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp"
])

// ── File-type filter ───────────────────────────────────────

/**
 * Multer fileFilter – rejects anything that isn't JPG, PNG or WebP.
 * Calls `cb(error)` so multer surfaces the rejection.
 */
const imageFileFilter: multer.Options["fileFilter"] = (_req, file, cb) => {
  if (ALLOWED_MIME_TYPES.has(file.mimetype)) {
    cb(null, true)
  } else {
    cb(new Error("Only JPG, PNG and WEBP images are allowed"))
  }
}

// ── Lazy multer singleton ──────────────────────────────────

let _upload: multer.Multer | null = null

/**
 * Builds (once) and returns the configured multer instance.
 * Cloudinary transformations auto-optimise every uploaded image:
 *   • quality "auto" – let Cloudinary pick the best compression
 *   • fetch_format "auto" – serve webp/avif when the browser supports it
 *   • width 1200 + crop "limit" – cap the long edge at 1200 px
 */
function getUploadMiddleware(): multer.Multer {
  if (!_upload) {
    const storage = new CloudinaryStorage({
      cloudinary: getCloudinary(),
      params: {
        folder: "finance-blog-images",
        allowed_formats: ["jpg", "jpeg", "png", "webp"],
        transformation: [
          {
            quality: "auto",
            fetch_format: "auto",
            width: 1200,
            crop: "limit"
          }
        ]
      } as Record<string, unknown>
    })

    _upload = multer({
      storage,
      limits: { fileSize: MAX_FILE_SIZE },
      fileFilter: imageFileFilter
    })
  }
  return _upload
}

// ── Middleware export ──────────────────────────────────────

/**
 * Express middleware that handles a single-file upload for `field`.
 *
 * Catches all multer / validation errors and returns a clean JSON
 * response instead of letting Express dump an HTML error page.
 *
 *   • LIMIT_FILE_SIZE  → 413  "Image must be smaller than 5MB"
 *   • Bad MIME type     → 400  "Only JPG, PNG and WEBP images are allowed"
 *   • Anything else     → 500  original message or "Upload failed"
 */
export function uploadSingle(field: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    const mw = getUploadMiddleware().single(field)

    mw(req, res, (err: unknown) => {
      if (!err) {
        next()
        return
      }

      // Multer's own errors (file-size limit, unexpected field, etc.)
      if (err instanceof MulterError) {
        if (err.code === "LIMIT_FILE_SIZE") {
          res.status(413).json({ error: "Image must be smaller than 5MB" })
          return
        }
        res.status(400).json({ error: err.message })
        return
      }

      // Our custom fileFilter rejection or Cloudinary errors
      if (err instanceof Error) {
        const status = err.message.includes("Only JPG") ? 400 : 500
        res.status(status).json({ error: err.message })
        return
      }

      // Fallback
      console.error("Upload error:", err)
      res.status(500).json({ error: "Upload failed" })
    })
  }
}