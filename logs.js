const attendanceJson = require('./logs.json')
const userJson = require('./users.json')
const fs = require('fs')
const Bio = require('./bio')

let biometric = new Bio()

//test
// const date = new Date(attendanceJson[23119]["recordTime"])
// const userID = attendanceJson[23119]["deviceUserId"]
// console.log(date)
// console.log(userID)

//OSEA ids
//Cess 1008, John 1009, Rendel 1011, Cristine 5001, Rodel 5004, Miles 5008, Jicoy 5010, Vincent 5011, Harry 5012, Ira 5013 
const oseaIDs = ["1008", "1009", "1011", "5001", "5004", "5008", "5010", "5011", "5012", "5013"]
// const oseaMembers = ["Cess", "John", "Rendel", "Cristine", "Rodel", "Miles", "Jicoy", "Vincent", "Harry", "Ira"]

const oseaLogs = attendanceJson.filter(log => oseaIDs.includes(log.deviceUserId))

oseaLogs.forEach(log => {
    
})

biometric.toJSON(oseaLogs, 'osea.json')





