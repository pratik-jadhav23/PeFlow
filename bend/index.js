let express = require("express")
const rt = require("./routes/rt")
const securePdfRoute = require("./routes/securePdfRoute")
let cors=require('cors')
require('dotenv').config();

const port = process.env.PORT || 5000;

let app=express()

app.use(express.json())

app.use(cors({
    origin: [process.env.CLIENT_ORIGIN, 'http://localhost:5173'],
    credentials: true
}));

app.get('/',(req,res)=>{
    res.send("Yup, it's working") 
})

app.use('/',rt)

// for secure pdfs
app.use('/secure',securePdfRoute)

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});