import multer from 'multer';


const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/temp")
  },
  filename: function (req, file, cb) {
    const originalNameWithoutExt = path.parse(file.originalname).name
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() *159);
    const extension = path.extname(file.originalname)
    cb(null, file.originalname + '-' + uniqueSuffix + extension);
  }
})

export const upload = multer({
    storage: storage,
})