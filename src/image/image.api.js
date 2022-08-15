const express  = require("express")
const {upload,UploadPhoto}  = require("../lib/cloudupload.js")

export function UploadImageAPI(UploadBLL){
  const router=express.Router()

  router.use(upload.single("img"))
  router.post("/upload",async (req,res)=>{
    const file=req.file
    const {path}=file
    const photo=await UploadPhoto(path)
    try {
      const image=await UploadBLL.UploadImage(photo)
      res.status(200).json(image)
    } catch (error) {
      res.json(500).json(error.message)
    }
  })

  return router
}