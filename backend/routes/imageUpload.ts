import express, { Request, Response } from "express"
import { uploadSingle } from "../middleware/cloudinaryUpload"

const router = express.Router()

/**
 * POST /api/upload/image
 *
 * Accepts a single image via multipart form-data (field name: "image").
 *
 * Validations (handled by middleware):
 *   • Max 5 MB
 *   • Only image/jpeg, image/png, image/webp
 *
 * Cloudinary auto-optimisations (applied at upload time):
 *   • quality  "auto"  – best compression per image
 *   • format  "auto"  – webp/avif when browser supports it
 *   • width   1200    – cap the long edge
 *
 * Success response: { url: "https://res.cloudinary.com/…" }
 */
router.post("/image", uploadSingle("image"), (req: Request, res: Response) => {
  // If middleware passed but no file object exists, the request was empty
  if (!req.file) {
    res.status(400).json({ error: "No image file provided" })
    return
  }

  // multer-storage-cloudinary attaches the Cloudinary URL to `file.path`
  const file = req.file as Express.Multer.File & { path?: string }
  const url = file.path ?? (file as any).secure_url ?? (file as any).url

  if (!url) {
    res.status(500).json({ error: "Upload succeeded but no URL returned" })
    return
  }

  res.json({ url })
})

export default router