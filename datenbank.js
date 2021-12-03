const dotenv = require("dotenv");
const fs = require("fs");
dotenv.config();

const fileName = process.env.fileName ?? "data.json";
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

exports.addIp = async function(name, ip) {
    // Daten einlesen
    let data
    try {
        await removeOldEntries();
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

exports.getIp = async function(name) {
    try {
        const data = await getData();
        return data[name.toLowerCase()];
    } catch(err) {
        return null
    }
}

const removeOldEntries = async function() {
    try {
            const timeDeletion = parseInt(process.env.TIMETILLDELETION);
            console.log(timeDeletion)
            const data = await getData();
            
            Object.entries(data).forEach(el => {
            const oldDate = new Date(el[1].createdAt);
                console.log(Date.now() - oldDate.getTime())
            if (Date.now() - oldDate.getTime() > timeDeletion) {
                console.log(el[0])
                delete data[el[0]]
            }
           
        })
        console.log(data)
        await writeDataToFile(JSON.stringify(data))

       
    } catch(err) {
        console.log(err)
        console.log("alte einträge konnten nicht gelöscht werden")
    }
}



