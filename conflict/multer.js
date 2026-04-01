import multer from "multer"

export const upload = multer({

  storage: multer.memoryStorage(),

  limits: {
    fileSize: 2 * 1024 * 1024 // 2MB
  },

  fileFilter: (req, file, cb) => {

    if (
      file.mimetype === "image/jpeg" ||
      file.mimetype === "image/png"
    ) {
      cb(null, true)
    } else {
      cb(new Error("Only JPG and PNG allowed"), false)
    }

  }

})