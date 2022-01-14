// importieren der dependencies
const express = require("express");
const path = require("path");
const app = express();
const cors = require("cors");
const dotenv = require("dotenv")

// importieren der datenbank functionen
const {addIp,getIp, removeOldEntries } = require("./datenbank.js");
const { system } = require("nodemon/lib/config");

// configuration der umgebungsvariablen
dotenv.config();


app.use(cors())
app.use(express.json());

// setzt den static path
app.use(express.static(path.join(__dirname, "dist", "client")))

// route um Zugriff auf eine IP-Adresse durch das Angeben eines Namens zu erhalten
app.get("/api/ip/:name", async (req,res) => {
    const name = req.params.name;
    // wenn kein name angegeben worden ist
    if (!name) {
        res.json({
            "status":400,
            "message":"Bitte gebe einen Namen ein"
        })
        return;
    }

    // durchsucht die Datenbank nach dem angegebenen namen
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
  
    // wenn kein Ergebnis gefunden wurde
    if (!IP) {
        res.json({
            "status":200,
            "message":"success",
            "data":null
        })
        return;
    }

    // nachricht, wenn eine IP-Adresse erfolgreich gefunden worden ist
    res.json({
        "status":200,
        "message":"success",
        "data":{
            name,
            ...IP
        }
    })
})

// route, um eine IP-Adresse zu erstellen
app.post("/api/ip", async (req,res) => {
    // name und IP-Adresse müssen im Body vorhanden sein
    // IP muss großgeschrieben sein
    const {name, IP} = req.body;
    if (!name || !IP) {
        res.json({
            "status":400,
            "message":"Bitte gebe einen Namen und eine IP-Adresse ein"
        })
        return;
    }
    // IP-Adresse wird in der Datenbank erstellt
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


// rendern der webseite 
app.get("/", (req,res) => {
    res.sendFile(path.join(__dirname, "dist", "client", "index.html"))
})

// starten des servers
const port = process.env.PORT
app.listen(port, () => {
    console.log("app running on port " + port)
})

// background worker, der einmal am tag alle eintraege loescht, die älter als ein Tag sind, damit die JSON-DAtei nicht zu groß wird
setInterval( async () => {
    console.log("background processor ")
    await removeOldEntries()
},parseInt(process.env.DELETIONTIMECHECK))


