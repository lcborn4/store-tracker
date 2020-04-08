require('dotenv').config()

console.log('process.env.UPDATE_TIMER', process.env.UPDATE_TIMER)
// setInterval(updateNotification, process.env.UPDATE_TIMER); //checks ever minute
updateNotification();
function updateNotification() {
    let now = new Date();
    let mins = now.getMinutes();
    let hours = now.getHours();
    console.log('now', now)
    console.log('mins', mins)
    console.log('hours', hours)
    const accountSid = process.env.ACCOUNTSID;
    const authToken = process.env.AUTH_TOKEN;
    const client = require('twilio')(accountSid, authToken);

    let numbers = (process.env.NUMBERS).split(',');
    console.log('numbers', numbers)
    console.log('numbers', numbers.length)
    numbers.forEach(number => {
        client.messages
            .create({
                body: `Let's play aoe`,
                from: process.env.FROM,
                to: number
            })
            .then(message => console.log(message.sid));
    });

}