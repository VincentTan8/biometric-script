const fs = require('fs').promises
const Bio = require('./bio')
const XLSX = require('xlsx')

async function run() {
    //Phihope
    const biometric = new Bio('171.16.109.24', 4370, 10000, 4000)
    const logsFileName = 'phihopeLogs.json'
    const usersFileName = 'phihopeUsers.json'
    //Wetalk
    // const biometric = new Bio('171.16.113.238', 4370, 10000, 4000)
    // const logsFileName = 'wetalkLogs.json'
    // const usersFileName = 'wetalkUsers.json'

    await biometric.connect()
    
    //this gets transactions from the chosen device and writes it into a json file
    const logs = await biometric.getTransactions().catch(err => {
        // Handle any uncaught errors from the test function
        console.error('Unhandled error in getTransactions:', err)
    })
    biometric.toJSON(logs.data, logsFileName)

    // await biometric.addUser('9999', "IT Test", 1234567890)

    // await biometric.deleteUser('82')
    
    //uid of existing user is needed to edit
    // '21','5011', 'VINCENT', 2714852516 phihope vincent
    // await biometric.editUser('21','5011', 'VINCENT', 2714852516) 
    //    .catch(err => {
    //     console.error('Unhandled error in editUser:', err)
    // })

    // const users = await biometric.getUsers().catch(err => {
    //     console.error('Unhandled error in getUsers:', err)
    // })
    // biometric.toJSON(users.data, usersFileName)

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
        if (!allIDs.includes(user.userId))
            allIDs.push(user.userId)
    })

    //for getting logs including IDs of deleted users
    // const allIDs = [...new Set(attendanceJson.map(log => log.deviceUserId ))]
    // console.log(allIDs)

    //this renames some of the fields and deletes unneeded fields
    const allLogs = biometric.makeReadable(
        attendanceJson.filter(log => allIDs.includes(log.deviceUserId)),
        userJson
    )
    biometric.toJSON(allLogs, 'readable.json')

    //get first and last log of each user
    let allFAL = []
    let startDate = new Date("10/08/2024") // MM/DD/YYYY 00:00:00
    let endDate = new Date("10/24/2024") // MM/DD/YYYY day before endDate will be taken
    allIDs.forEach(id => {
        const userLogs = allLogs.filter(log => log.deviceUserId === id)
        const firstAndLast = biometric.getFirstAndLastLogPerDay(userLogs, startDate, endDate)
        allFAL.push(...firstAndLast)
    })

    // To Excel
    // Create a new workbook and add a worksheet
    let workbook = XLSX.utils.book_new()
    let worksheet = XLSX.utils.json_to_sheet(allFAL)

    // Append the worksheet to the workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1')

    // Write the workbook to an Excel file
    XLSX.writeFile(workbook, 'logs.xlsx')
    console.log("logs.xlsx successfully written")
}

run()







