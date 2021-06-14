// TO DO:
// 1. make app run on a schdule, a few times a day, exept when servers are closed.
// 2. communiate availability result to user, screen shot / mapped data of each test center and wether they have slots available

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
  headless: true, 
  slowMo: 30,
  defaultViewport: null,
  args: customArgs
}

const handleRecaptcha = async(page) => {
  try {
    for (const frame of await page.mainFrame().childFrames()) {
      console.log('🚨 recaptcha found')
      await frame.solveRecaptchas()
      console.log('🧩 recaptcha solved')
    }
  } catch (err) {
    console.log(err)
  }
}


const checkWebsite = async() => {
  try {
    // * launch puppetteer
    console.log('🚀 launching puppeteer')
    const browser = await puppeteer.launch(chromeOptions)
    const page = await browser.newPage()
    await page.goto('https://driverpracticaltest.dvsa.gov.uk/login')

    // ?  page nav (potential reCaptcha checkpoint)
    await handleRecaptcha(page)
  
    // * Wait to leave server queue
    console.log('🚨 entering server queue')
    await page.waitForNavigation({ timeout: timeoutDuration })
    //console.log('✅ left server queue')

    // ?  page nav (potential reCaptcha checkpoint)
    // await handleRecaptcha(page)
    // console.log('🚀 page navigated')

    // * handle login form
    await page.waitForSelector('#driving-licence-number', { timeout: timeoutDuration })
    console.log('✅ left server queue')
    console.log('🚀 page navigated')
    await page.type('#driving-licence-number', drivingLicenceNumber)
    await page.click('#use-theory-test-number', { delay: clickDelay  })
    await page.type('#theory-test-pass-number', theoryTestPassNumber)
    await page.click('#booking-login', { delay: clickDelay  })
    console.log('✅ logged in')

    // ?  page nav (potential reCaptcha checkpoint)
    await handleRecaptcha(page)
    console.log('🚀 page navigated')

    // * next page actions
    await page.waitForSelector('#test-centre-change', { timeout: timeoutDuration })
    await page.click('#test-centre-change', { delay: clickDelay  })
    console.log('✅ form submitted')

    // ? page nav (potential reCaptcha checkpoint)
    await handleRecaptcha(page)
    console.log('🚀 page navigated')
  
    // * next page actions
    await page.waitForSelector('#test-centres-input', { timeout: timeoutDuration })
    await page.type('#test-centres-input', 'PO9 6DY')
    await page.click('#test-centres-submit', { delay: clickDelay  })
    console.log('✅ form submitted')

    // ?  page nav (potential reCaptcha checkpoint)
    await handleRecaptcha(page)
    console.log('🚀 page navigated')

    // * results page
    const resultsArray = await page.$$eval('.test-centre-details > span', results => results.map(result => result.textContent))
    console.log('👀 RESULTS FOUND ->', await resultsArray)
    await page.screenshot({ path: 'results-page.png' })

    // * done
    await browser.close()

  } catch (err) {
    console.log(err)
  }
}

checkWebsite()