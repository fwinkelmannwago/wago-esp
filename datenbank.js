// importieren der dependencies
const dotenv = require("dotenv");
const fs = require("fs");

// laden der Umgebungsvariablen
dotenv.config();

// variable für die Datei, die die Daten hält
const fileName = process.env.fileName ?? "data.json";

// liest die Daten aus der Datei ein und returned sie als Javascript object
const getData = () => new Promise((resolve,reject) => {
    fs.readFile(fileName, (err, data ) => {
        if (err) {
            console.log(err)
            reject(err)
        } else {
            let result;
            try {
                result = JSON.parse(data)
                resolve(result)
            } catch (err) {
                resolve(null)
            }
        }
    })
})

// schreibt daten in die Datei -> es müssen jeweils die gesamten Daten angegeben werden (also kein appending der Datei)
const writeDataToFile = function(newData) {
    return new Promise((resolve,reject) => {
        fs.writeFile(fileName, newData, err => {
            if (err) {
                reject(err)
            }
            resolve(true)
        })
    })
} 

// Funktion zum hinzufügen einer Ip
exports.addIp = async function(name, ip) {
    // Daten einlesen
    let data
    try {
        data = await getData();
    } catch(err) {
        console.log(err)
        return null
    }

   
    const newIP = {
        "IP":ip,
        "createdAt":new Date()
    }
    data = data ? data : {}
    // ip erstellen bzw überschreiben
    data[name.toLowerCase()] = newIP;
    // daten wieder in der Datei speichern
    writeDataToFile(JSON.stringify(data));

    return newIP;
    
}

// funktion um eine IP-Adresse aus der Datenbank zu erhalten
exports.getIp = async function(name) {
    try {
        const data = await getData();
        return data[name.toLowerCase()];
    } catch(err) {
        return null
    }
}

// entfernt einträge die älter sind als ein Tag
exports.removeOldEntries = async function() {
    try {

            const timeDeletion = parseInt(process.env.TIMETILLDELETION);
            
            const data = await getData();
            
            // durchläuft die Daten
            Object.entries(data).forEach(el => {
            const oldDate = new Date(el[1].createdAt);
            console.log(new Date().getTime() - oldDate.getTime())

                // wenn die IP-Adresse zu alt ist, wird sie aus dem data object gelöscht
                if (Date.now() - oldDate.getTime() > timeDeletion) {
                console.log("Es wurde der Eintrag " + JSON.stringify(data) + " gelöscht");
                delete data[el[0]]
            }
           
        })

        // das veränderte Datenobject wird wieder in der Datei abgespeichert
        await writeDataToFile(JSON.stringify(data))

    } catch(err) {
        console.log(err)
        console.log("alte einträge konnten nicht gelöscht werden")
    }
}


