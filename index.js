const puppeteer = require('puppeteer');
const url = 'https://centralmarket.com/shop/';

const CURBSIDE = 'Curbside Pickup';
const PICKUP_TIMES = 'All pickup times are sold out';
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

        //if not in story only
        if (!storeStatuses[i].includes(IN_STORE)) {

            //check if slot is open
            if (!storeStatuses[i].includes(PICKUP_TIMES)) {
                console.log('slot open')
            }

        }
        stores[i].raw_status = storeStatuses[i];
    }

    await browser.close();
}