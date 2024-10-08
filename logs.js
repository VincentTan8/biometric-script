const fs = require('fs')
const Bio = require('./bio')

let biometric = new Bio()

async function run() {
    //this gets transactions from the chosen device and writes it into a json file
    await biometric.getTransactions().catch(err => {
        // Handle any uncaught errors from the test function
        console.error('Unhandled error in test function:', err);
    })
    //read after getting transactions
    const attendanceJson = require('./logs.json')
    const userJson = require('./users.json')

    //testing lang hehe
    // const date = new Date(attendanceJson[23119]["recordTime"])
    // const userID = attendanceJson[23119]["deviceUserId"]
    // console.log(date)
    // console.log(userID)

    //OSEA ids
    //Cess 1008, John 1009, Rendel 1011, Cristine 5001, Rodel 5004, Miles 5008, Jicoy 5010, Vincent 5011, Harry 5012, Ira 5013 
    const oseaIDs = ["1008", "1009", "1011", "5001", "5004", "5008", "5010", "5011", "5012", "5013"]
    // const oseaMembers = ["Cess", "John", "Rendel", "Cristine", "Rodel", "Miles", "Jicoy", "Vincent", "Harry", "Ira"]

    const oseaLogs = biometric.makeReadable(
        attendanceJson.filter(log => oseaIDs.includes(log.deviceUserId)),
        userJson
    )

    const harryLogs = oseaLogs.filter(log => log.userName === "HARRY")
    const firstAndLast = biometric.getFirstAndLastLogPerDay(harryLogs)

    biometric.toJSON(oseaLogs, 'osea.json')
}

run()







