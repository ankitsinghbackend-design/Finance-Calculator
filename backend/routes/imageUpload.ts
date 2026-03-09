import express, { Request, Response } from "express"
import { uploadSingle } from "../middleware/cloudinaryUpload"

const router = express.Router()

router.post("/image", uploadSingle("image"), (req: Request, res: Response) => {
  if (!req.file) {
    res.status(400).json({ error: "No image file provided" })
    return
  }
  const file = req.file as Express.Multer.File & { path?: string }
  const url = file.path ?? (file as any).secure_url ?? (file as any).url
  if (!url) {
    res.status(500).json({ error: "Upload succeeded but no URL returned" })
    return
  }
  res.json({ url })
})

export default router