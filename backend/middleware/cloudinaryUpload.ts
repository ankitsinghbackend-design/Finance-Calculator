import multer from "multer"
import { CloudinaryStorage } from "multer-storage-cloudinary"
import { getCloudinary } from "../config/cloudinary"
import { Request, Response, NextFunction } from "express"

let _upload: multer.Multer | null = null

function getUploadMiddleware() {
  if (!_upload) {
    const storage = new CloudinaryStorage({
      cloudinary: getCloudinary(),
      params: {
        folder: "finance-blog-images",
        allowed_formats: ["jpg", "png", "jpeg", "webp"]
      } as Record<string, unknown>
    })
    _upload = multer({ storage })
  }
  return _upload
}

export function uploadSingle(field: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    const mw = getUploadMiddleware().single(field)
    mw(req, res, (err: unknown) => {
      if (err) {
        console.error("Upload error:", err)
        const message = err instanceof Error ? err.message : "Upload failed"
        res.status(500).json({ error: message })
        return
      }
      next()
    })
  }
}