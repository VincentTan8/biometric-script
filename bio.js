const fs = require('fs')
const ZKLib = require('./node_modules/node-zklib/zklib')

class Bio {
    async test(){

        console.log("Initializing...")

        //Phihope 
        let zkInstance = new ZKLib('171.16.109.24', 4370, 10000, 4000);
        //Wetalk
        // let zkInstance = new ZKLib('171.16.113.238', 4370, 10000, 4000);

        try {
            // Create socket to machine 
            console.log("Connecting...")
            await zkInstance.createSocket()
            console.log("Connected!")

            // Get general info like logCapacity, user counts, logs count
            // It's really useful to check the status of device 
            console.log(await zkInstance.getInfo())
        } catch (e) {
            console.log(e)
            if (e.code === 'EADDRINUSE') {
            }
        }

        // Get users in machine 
        const users = await zkInstance.getUsers()
        console.log("Total users: " + users.data.length)

        // Get all logs in the machine 
        // Currently, there is no filter to take data, it just takes all !!
        const logs = await zkInstance.getAttendances()
        console.log("Total Attendances: "+ logs.data.length);

        // const attendances = await zkInstance.getAttendances((percent, total)=>{
        //     // this callbacks take params is the percent of data downloaded and total data need to download 
        //     // console.log(attendances.data);
        // })

        // YOu can also read realtime log by getRealTimelogs function

        // console.log('check users', users)

        // zkInstance.getRealTimeLogs((data)=>{
        //     // do something when some checkin 
        //     console.log("real time")
        //     console.log(data)
        // })

        // delete the data in machine
        // You should do this when there are too many data in the machine, this issue can slow down machine 
        // zkInstances.clearAttendanceLog();
        
        // Get the device time
        // const getTime = await zkInstance.getTime();
        // console.log(getTime);


        //write to JSON file
        this.toJSON(logs.data, 'logs.json')
        // toJSON(users.data, 'users.json')

        // Disconnect the machine ( don't do this when you need realtime update :))) 
        if (zkInstance) {
            try {
                await zkInstance.disconnect();
                console.log('Disconnected!')
            } catch (error) {
                console.log('Error closing the socket:', error);
            }
        }

    }

    toJSON (data, filename){
        // Convert the logs to a JSON string
        const jsonData = JSON.stringify(data, null, 2); // 'null, 2' adds indentation for readability

        // // Write the JSON string to a file
        fs.writeFile(filename, jsonData, (err) => {
            if (err) {
                console.error("An error occurred while writing to the file:", err);
                return;
            }
            console.log("JSON data successfully written");
        });
    }
}

//this gets transactions from the chosen device and writes it into a json file
// const biometric = new Bio()
// biometric.test().catch(err => {
//     // Handle any uncaught errors from the test function
//     console.error('Unhandled error in test function:', err);
// })

module.exports = Bio 