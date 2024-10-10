const fs = require('fs').promises
const Bio = require('./bio')
const XLSX = require('xlsx');

let biometric = new Bio()

async function run() {
    //this gets transactions from the chosen device and writes it into a json file
    // await biometric.getTransactions().catch(err => {
    //     // Handle any uncaught errors from the test function
    //     console.error('Unhandled error in test function:', err);
    // })
    //read after getting transactions
    const attendanceContent = await fs.readFile('logs.json', 'utf-8')
    const attendanceJson = JSON.parse(attendanceContent)
    const userContent = await fs.readFile('users.json', 'utf-8')
    const userJson = JSON.parse(userContent)

    //OSEA ids
    //Cess 1008, John 1009, Rendel 1011, Cristine 5001, Rodel 5004, Miles 5008, Jicoy 5010, Vincent 5011, Harry 5012, Ira 5013 
    const oseaIDs = ["1008", "1009", "1011", "5001", "5004", "5008", "5010", "5011", "5012", "5013"]
    // const oseaMembers = ["Cess", "John", "Rendel", "Cristine", "Rodel", "Miles", "Jicoy", "Vincent", "Harry", "Ira"]
    const oseaLogs = biometric.makeReadable(
        attendanceJson.filter(log => oseaIDs.includes(log.deviceUserId)),
        userJson
    )
    biometric.toJSON(oseaLogs, 'osea.json')

    //get first and last log of each user
    let oseaFAL = []
    let startDate = new Date("10/07/2024") // MM/DD/YYYY
    oseaIDs.forEach(id => {
        const userLogs = oseaLogs.filter(log => log.deviceUserId === id)
        const firstAndLast = biometric.getFirstAndLastLogPerDay(userLogs, startDate)
        oseaFAL.push(...firstAndLast)
    })
    
    // biometric.toJSON(oseaFAL, 'oseaFAL.json')

    //To Excel
    // Create a new workbook and add a worksheet
    let workbook = XLSX.utils.book_new();
    let worksheet = XLSX.utils.json_to_sheet(oseaFAL);

    // Append the worksheet to the workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');

    // Write the workbook to an Excel file
    XLSX.writeFile(workbook, 'osea.xlsx');
}

run()







