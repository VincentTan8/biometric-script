const fs = require('fs').promises
const Bio = require('./bio')
const XLSX = require('xlsx');

let biometric = new Bio()

async function run() {
    const logsFileName = 'logs.json'
    const usersFileName = 'users.json'

    await biometric.connect()
    //this gets transactions from the chosen device and writes it into a json file
    await biometric.getTransactions(logsFileName).catch(err => {
        // Handle any uncaught errors from the test function
        console.error('Unhandled error in getTransactions:', err);
    })
    await biometric.getUsers(usersFileName).catch(err => {
        console.error('Unhandled error in getUsers:', err)
    })
    await biometric.disconnect()

    //read after getting transactions
    const attendanceContent = await fs.readFile(logsFileName, 'utf-8')
    const attendanceJson = JSON.parse(attendanceContent)
    const userContent = await fs.readFile(usersFileName, 'utf-8')
    const userJson = JSON.parse(userContent)

    //OSEA ids only
    //Cess 1008, John 1009, Rendel 1011, Cristine 5001, Rodel 5004, Miles 5008, Jicoy 5010, Vincent 5011, Harry 5012, Ira 5013 
    //const oseaIDs = ["1008", "1009", "1011", "5001", "5004", "5008", "5010", "5011", "5012", "5013"]
    // const oseaMembers = ["Cess", "John", "Rendel", "Cristine", "Rodel", "Miles", "Jicoy", "Vincent", "Harry", "Ira"]
    
    //get all unique IDs
    const allIDs = []
    userJson.forEach(user => {
        allIDs.push(user.userId)
    })

    //this renames some of the fields and deletes unneeded fields
    const oseaLogs = biometric.makeReadable(
        attendanceJson.filter(log => allIDs.includes(log.deviceUserId)),
        userJson
    )
    biometric.toJSON(oseaLogs, 'osea.json')

    //get first and last log of each user
    let oseaFAL = []
    let startDate = new Date("10/07/2024") // MM/DD/YYYY
    allIDs.forEach(id => {
        const userLogs = oseaLogs.filter(log => log.deviceUserId === id)
        const firstAndLast = biometric.getFirstAndLastLogPerDay(userLogs, startDate)
        oseaFAL.push(...firstAndLast)
    })

    // To Excel
    // Create a new workbook and add a worksheet
    let workbook = XLSX.utils.book_new();
    let worksheet = XLSX.utils.json_to_sheet(oseaFAL);

    // Append the worksheet to the workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');

    // Write the workbook to an Excel file
    XLSX.writeFile(workbook, 'logs.xlsx');
    console.log("logs.xlsx successfully written")
}

run()







