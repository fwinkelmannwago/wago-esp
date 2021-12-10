const express = require("express");
const path = require("path");
const app = express();
const cors = require("cors");
const {addIp,getIp } = require("./datenbank.js")
const dotenv = require("dotenv")
dotenv.config();

app.use(cors())
app.use(express.json());

app.use(express.static(path.join(__dirname, "dist", "client")))


app.get("/api/ip/:name", async (req,res) => {
    const name = req.params.name;
   
    if (!name) {
        res.json({
            "status":400,
            "message":"Bitte gebe einen Namen ein"
        })
        return;
    }
    let IP
    try {
        IP = await getIp(name);
    } catch(err) {
        res.json({
            "status":500,
            "message":"Es ist ein Fehler aufgetreten"
        })
        return;
    }
  

    if (!IP) {
        res.json({
            "status":200,
            "message":"success",
            "data":null
        })
        return;
    }

    res.json({
        "status":200,
        "message":"success",
        "data":{
            name,
            ...IP
        }
    })
})


app.post("/api/ip", async (req,res) => {
    const {name, IP} = req.body;
    if (!name || !IP) {
        res.json({
            "status":400,
            "message":"Bitte gebe einen Namen und eine IP-Adresse ein"
        })
        return;
    }
    let IPdata
    try {
        IPdata = await addIp(name, IP);

        res.json({
            "status":201,
            "message":"success",
            "data":IPdata
        })
    } catch(err) {
        console.log(err)
        res.json({
            "status":500,
            "message":"Es ist ein Fehler aufgetreten"
        })
        return;
    }

   
})



app.get("/", (req,res) => {
    res.sendFile(path.join(__dirname, "dist", "client", "index.html"))
})



const port = process.env.PORT
app.listen(port, () => {
    console.log("app running on port " + port)
})


