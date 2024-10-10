const fs = require('fs')
const ZKLib = require('./node_modules/node-zklib/zklib')

//Phihope 
let zkInstance = new ZKLib('171.16.109.24', 4370, 10000, 4000);
//Wetalk
// let zkInstance = new ZKLib('171.16.113.238', 4370, 10000, 4000);
let info = {}

class Bio {
    async connect() {
        console.log("Initializing...")
        try {
            // Create socket to machine 
            console.log("Connecting...")
            await zkInstance.createSocket()

            // Get general info like logCapacity, user counts, logs count
            // It's really useful to check the status of device 
            info = await zkInstance.getInfo()
            console.log(info)
        } catch (e) {
            console.log(e)
            if (e.code === 'EADDRINUSE') {
            }
        }
    }

    async disconnect() {
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
    
    async getTransactions(logsFileName) {
        await this.connect()

        // Get all logs in the machine 
        // Currently, there is no filter to take data, it just takes all !! (which is sad)
        const logs = await zkInstance.getAttendances()
        console.log("Total Attendances: "+ logs.data.length);

        // You can also read realtime log by getRealTimelogs function (which doesnt work)

        // zkInstance.getRealTimeLogs((data)=>{
        //     // do something when some checkin 
        //     console.log("real time")
        //     console.log(data)
        // })

        // delete the data in machine
        // You should do this when there are too many data in the machine, this issue can slow down machine 
        // zkInstances.clearAttendanceLog();
        
        // Get the device time
        const getTime = await zkInstance.getTime();
        console.log("Time now is: " + getTime.toString());

        //write to JSON file
        this.toJSON(logs.data, logsFileName)
        
        await this.disconnect()
    }

    //not yet done
    async getUsers(usersFileName) {
        await this.connect()

        // Get users in machine to reference ids in logs
        let users = await zkInstance.getUsers()
        console.log("Total users: " + users.data.length)
        while(users.data.length != info.userCounts){
            console.log("User count mismatch")
            console.log("Retrying...")
            users = await zkInstance.getUsers()
            console.log("Total users: " + users.data.length)
        }

        //write to JSON file
        this.toJSON(users.data, usersFileName)

        await this.disconnect()
    }

    async addUser() {

    }

    async editUser() {

    }

    async deleteUser() {

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
            console.log(filename + " successfully written");
        });
    }

    makeReadable(data, userData) {
        data.forEach(log => {
            const user = userData.find(user => user.userId === log.deviceUserId)
            if(user)
                log.userName = user.name //make new field
            else
                log.userName = "UserID Not Found: " + log.deviceUserId

            //just for rearranging the field 
            log.timeStamp = log.recordTime

            //removed for clarity, idk what the hr will need from these anyway
            //all they need is the timestamp and name I think
            delete log.userSn
            delete log.ip
            delete log.recordTime
        })
        return data;
    }

    getFirstAndLastLogPerDay(data, startDate) {
        //data is logs of one user
        const filteredLogs = []
        let firstAndLast = []
        let currentDate = " "
        data.forEach(log => {
            const date = new Date(log.timeStamp)
            //+1 on month since month is 0 index
            const dateText = date.getFullYear() + "/" + (date.getMonth()+1) + "/" + date.getDate()
            //if date is after the start date
            if(date >= startDate) {
                //if date is equal to the date we are checking
                if(dateText === currentDate) {
                    if(firstAndLast.length < 2) {
                        firstAndLast.push(log)
                    } else {
                        //replace the potential last entry of the day
                        firstAndLast[1] = log
                    }
                } else {
                    if(firstAndLast[1]){
                        //last log of the day
                        filteredLogs.push(firstAndLast[1])
                    } 
                    //first log of the day
                    filteredLogs.push(log)

                    //set to the current day log
                    currentDate = dateText
                    firstAndLast = []
                    firstAndLast.push(log)
                }
            }
        })
        return filteredLogs;
    }
}

module.exports = Bio 