const puppeteer = require('puppeteer');

require('dotenv').config()
console.log('process.env.STORE_CHECK_TIMER', process.env.STORE_CHECK_TIMER)
console.log('process.env.UPDATE_TIMER', process.env.UPDATE_TIMER)

const url = 'https://centralmarket.com/shop/';

const CURBSIDE = 'Curbside Pickup';
const PICKUP_TIMES = 'All pickup times are sold out';
// const PICKUP_TIMES_AVAILABLE = 'Available';
const PICKUP_TIMES_AS_SOON_AS = 'as soon as';
const IN_STORE = 'In-Store shopping only';

const STORE_LIST = '.cm-delivery-modal-stores'
const STORE_LIST_WRAPPER = '.cm-delivery-modal-stores-wrapper'
const DELIVERY_STORE_INFO = '.cm-delivery-modal-store-info';
const MESSAGE_FULL = '.type-full';
const STORE_NAME_SELECTOR = '#fulfillment-stores-all > ul > li > div.cm-delivery-modal-store-info > h5'
const STORE_STATUS_SELECTOR = '#fulfillment-stores-all > ul > li > div.cm-delivery-modal-store-info > div'
const STORE_SELECTOR = '#fulfillment-stores-all > ul > li > div.cm-delivery-modal-store-info'
const STORE_NAME = 'Austin North Lamar';

const STORE_CHECK_TIMER = process.env.STORE_CHECK_TIMER || 10 * 60 * 60;

checkSlot();
setInterval(checkSlot, STORE_CHECK_TIMER);
setInterval(updateNotification, process.env.UPDATE_TIMER); //checks ever minute

async function checkSlot() {
    console.log('checkSlot')
    const browser = await puppeteer.launch();
    // {
    //     headless: true,
    //     args: ['--no-sandbox', '--disable-setuid-sandbox'],
    // }

    const page = await browser.newPage();
    await page.goto(url);

    await page.waitForSelector(STORE_LIST_WRAPPER); //wait for the store list

    //store names
    var storeNames = await page.$$eval(STORE_NAME_SELECTOR, list => {
        return list.map(data => data.textContent);
    });
    console.log('storeNames.length', storeNames.length)
    console.log('storeNames', storeNames)

    var storeStatuses = await page.$$eval(STORE_SELECTOR, list => {
        return list.map(data => data.textContent);
    });
    // console.log('storeStatuses.length', stores.length)
    // console.log('stores', stores)
    // console.log('stores[0]', stores[0].trim())

    let stores = [];
    storeNames.forEach(storeName => {
        let newStore = {
            name: storeName
        }
        stores.push(newStore);
    })

    for (let i = 0; i < storeStatuses.length; i++) {

        // console.log('storeStatuses[i]', storeStatuses[i]) //debug

        stores[i].raw_status = storeStatuses[i];

        //if not in story only
        if (!storeStatuses[i].includes(IN_STORE)) {

            //check if slot is open
            if (!storeStatuses[i].includes(PICKUP_TIMES) && (!storeStatuses[i].includes(PICKUP_TIMES_AS_SOON_AS))) {
                console.log('slot open')

                const accountSid = process.env.ACCOUNTSID;
                const authToken = process.env.AUTH_TOKEN;
                const client = require('twilio')(accountSid, authToken);

                //only for Austin North Lamar
                if (stores[i].name === 'Austin North Lamar') {
                    client.messages
                        .create({
                            body: `Store: ${stores[i].name} has a slot open.`,
                            from: process.env.FROM,
                            to: process.env.TO
                        })
                        .then(message => console.log(message.sid));
                }

            }

        }

    }
    console.log('wait 10 mins')

    await browser.close();
}

function updateNotification() {
    let now = new Date();
    let mins = now.getMinutes();
    let hours = now.getHours();
    console.log('now', now)
    console.log('mins', mins)
    console.log('hours', hours)
    // 9am EST
    if (mins === 0 && hours === 13) {
        const accountSid = process.env.ACCOUNTSID;
        const authToken = process.env.AUTH_TOKEN;
        const client = require('twilio')(accountSid, authToken);

        let numbers = (process.env.NUMBERS).split(',');
        console.log('numbers', numbers)
        console.log('numbers', numbers.length)
        numbers.forEach(function (number) {
            var message = client.messages.create({
                body: 'Store Tracker is online',
                from: process.env.FROM,
                to: number
            })
                .then(message => console.log(message.status))
                .done();
        })
    }
    else {
        console.log('not top of hour')
    }
}