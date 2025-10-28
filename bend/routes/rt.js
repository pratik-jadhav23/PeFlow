let express=require('express')
const { upload, parse } = require('../controllers/mainCon')

let rt=express.Router()

rt.post("/parse",upload.single('file'),parse)

module.exports=rt