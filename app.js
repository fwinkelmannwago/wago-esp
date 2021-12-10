const express = require("express");
const path = require("path")
const rateLimit = require("express-rate-limit")
const dotenv = require("dotenv");
const app = express();
const xss = require("xss-clean")
const helmet = require("helmet")
const {addIp,getIp } = require("./datenbank.js")
const cors = require("cors");
dotenv.config()


app.use(cors());
app.use(express.json({limit: '10kb'}))


const limit = rateLimit({
    max: 100,// max requests
    windowMs: 60 * 60 * 1000, // 1 Hour
    message: 'Too many requests' // message to send
});

app.use("/api/ip", limit);

app.use(xss())

app.use(helmet())

app.use(express.static(path.join(__dirname, "dist")))

app.use((req,res) => {
    res.setHeader("Content-Security-Policy:", "default-src 'self'")
})

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

app.get("*", (req,res) => {
    res.sendFile(path.join(__dirname, "dist", "index.html"))
})

const PORT = process.env.PORT ?? 3000;

app.listen(PORT, () => {
    console.log(`APP LISTENING ON ${PORT}`)
})



