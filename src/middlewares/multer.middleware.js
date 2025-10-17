import multer from 'multer';
import path from 'path'

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/temp")
  },
  filename: function (req, file, cb) {
    const originalNameWithoutExt = path.parse(file.originalname).name
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() *159);
    const extension = path.extname(file.originalname)
    cb(null, originalNameWithoutExt + '-' + uniqueSuffix + extension);
  }
})

export const upload = multer({
    storage: storage,
})