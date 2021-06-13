// TO DO:
// 1. scrape desination page and map through test centers to see if dates are found/not found
// 2. make app run on a schdule, a few times a day, exept when servers are closed.
// 3. communiate availability result to user, screen shot / mapped data of each test center and wether they have slots available

// EXTRA FEATURE: if slot is available, make the bot book the next available slot for you. At present you ould have to login-in yourself ASAP and hope the slot is still available. 

import dotenv from 'dotenv'
import puppeteer from 'puppeteer-extra'
import StealthPlugin from 'puppeteer-extra-plugin-stealth'
import RecaptchaPlugin from 'puppeteer-extra-plugin-recaptcha'

dotenv.config()

// .env variables for hiding sensitive info
const apiToken = process.env['API_TOKEN']
const drivingLicenceNumber = process.env['DRIVING_LICENCE_NUMBER']
const theoryTestPassNumber = process.env['THEORY_TEST_PASS_NUMBER']

// application global variables
const timeoutDuration = 480000
const clickDelay = 30

puppeteer.use(StealthPlugin())
puppeteer.use(
  RecaptchaPlugin({
    provider: { id: '2captcha', token: apiToken },
    visualFeedback: true // colorize reCAPTCHAs (violet = detected, green = solved)
  })
)

const customArgs = [
  '--disable-features=IsolateOrigins,site-per-process',
  '--flag-switches-begin --disable-site-isolation-trials --flag-switches-end', 
  '--disable-web-security'
]

const chromeOptions = {
  executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  headless: false, 
  slowMo: 30,
  defaultViewport: null,
  args: customArgs
}

const handleRecaptcha = async(page) => {
  try {
    for (const frame of await page.mainFrame().childFrames()) {
      await frame.solveRecaptchas()
    }
  } catch (err) {
    console.log(err)
  }
}

const checkWebsite = async() => {
  try {
    // launch puppetteer
    const browser = await puppeteer.launch(chromeOptions)
    const page = await browser.newPage()
    await page.goto('https://driverpracticaltest.dvsa.gov.uk/login')

    // * page nav
    await handleRecaptcha(page)
  
    // Wait to leave server queue
    await page.screenshot({ path: '1.png' })

    // * page nav
    await handleRecaptcha(page)

    // handle login form
    await page.waitForSelector('#driving-licence-number', { timeout: timeoutDuration })
    await page.type('#driving-licence-number', drivingLicenceNumber)
    await page.click('#use-theory-test-number', { delay: clickDelay  })
    await page.type('#theory-test-pass-number', theoryTestPassNumber)
    await page.click('#booking-login', { delay: clickDelay  })
    await page.screenshot({ path: '2.png' })

    // * page nav
    await handleRecaptcha(page)

    // next page actions
    await page.waitForSelector('#test-centre-change', { timeout: timeoutDuration })
    await page.click('#test-centre-change', { delay: clickDelay  })
    await page.screenshot({ path: '3.png' })

    // * page nav
    await handleRecaptcha(page)
  
    // next page actions
    await page.waitForSelector('#test-centres-input', { timeout: timeoutDuration })
    await page.type('#test-centres-input', 'PO9 6DY')
    await page.click('#test-centres-submit', { delay: clickDelay  })
    await page.screenshot({ path: 'results-page.png' })

    // * for when page is reached, map data for a result / communicated/notified to user / process complete
    //await browser.close()
  } catch (err) {
    console.log(err)
  }
}

checkWebsite()