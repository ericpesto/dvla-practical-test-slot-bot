// TO DO:
// 1. must simulate user clicks on recaptcha iframes, if captcha is visible.
// 2. scrape desination page and map through test centers to see if dates are found/not found
// 3. make app run on a schdule, a few times a day, exept when servers are closed.
// 4. communiate availability result to user, screen shot / mapped data of each test center and wether they have slots available

// EXTRA FEATURE: if slot is available, make the bot book the next available slot for you. At present you ould have to login-in yourself ASAP and hope the slot is still available. 

import dotenv from 'dotenv'
import puppeteer from 'puppeteer-extra'
import StealthPlugin from 'puppeteer-extra-plugin-stealth'

dotenv.config()

// ! You must have Buster Chrome extension downlaoded to Chrome for reCAPTCHA busting.
// const pathToExtension = '~/Library/Application Support/Google/Chrome/Default/Extensions/mpbjkejclgfgadiemmefgebjfooflfhl/1.2.0_0'

// .env variables for hiding sensitive info
const drivingLicenceNumber = process.env['DRIVING_LICENCE_NUMBER']
const theoryTestPassNumber = process.env['THEORY_TEST_PASS_NUMBER']

// application global variables
const timeoutDuration = 240000
const clickDelay = 30

puppeteer.use(StealthPlugin())

const customArgs = [
  // `--disable-extensions-except=${pathToExtension}`,
  // `--load-extension=${pathToExtension}`,
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

// * try 2captcha again now you can find the frame
const handleRecaptcha = async(page) => {
  try {
    await page.waitForTimeout(3000)
    const frames = await page.frames()
    const mainFrame = frames.find((frame) => frame.name() === 'main-iframe')
    // console.log('mainFrame ->', await mainFrame)
    const recaptchaFrame = await mainFrame.childFrames().find((frame) => frame.url().startsWith('https://www.google.com/recaptcha/api2/anchor'))
    if (recaptchaFrame) {
      // console.log('recaptchaFrame ->', await recaptchaFrame)
      await recaptchaFrame.click('#rc-anchor-container', { delay: clickDelay  })
      await page.waitForTimeout(3000)
      // * try 2captcha again now you can find the frame
      //await recaptchaFrame.click('#solver-button', { delay: clickDelay  })

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
    handleRecaptcha(page)

    // Wait to leave server queue
    await page.waitForNavigation({ timeout: timeoutDuration })
    await page.waitForTimeout(1000)
    await page.screenshot({ path: '1.png' })

    // * page nav
    handleRecaptcha(page)

    // handle login form
    await page.waitForTimeout(1000)
    await page.waitForSelector('#driving-licence-number', { timeout: timeoutDuration })
    await page.type('#driving-licence-number', drivingLicenceNumber)
    await page.click('#use-theory-test-number', { delay: clickDelay  })
    await page.type('#theory-test-pass-number', theoryTestPassNumber)
    await page.click('#booking-login', { delay: clickDelay  })
    await page.screenshot({ path: '2.png' })

    // * page nav
    handleRecaptcha(page)

    // next page actions
    await page.waitForTimeout(1000)
    await page.waitForSelector('#test-centre-change', { timeout: timeoutDuration })
    await page.click('#test-centre-change', { delay: clickDelay  })
    await page.screenshot({ path: '3.png' })

    // * page nav
    handleRecaptcha(page)

    // next page actions
    await page.waitForTimeout(1000)
    await page.waitForSelector('#test-choice-earliest', { timeout: timeoutDuration })
    await page.click('#test-choice-earliest', { delay: clickDelay  })
    await page.click('#driving-licence-submit', { delay: clickDelay  })
    await page.screenshot({ path: '4.png' })

    // * page nav
    handleRecaptcha(page)
  
    // next page actions
    await page.waitForTimeout(1000)
    await page.waitForSelector('#test-centres-input', { timeout: timeoutDuration })
    await page.type('#test-centres-input', 'PO9 6DY')
    await page.click('#test-centres-submit', { delay: clickDelay  })
    await page.screenshot({ path: '5.png' })

    // * for when page is reached, map data for a result / communicated/notified to user / process complete
    //await browser.close()
  } catch (err) {
    console.log(err)
  }
}

checkWebsite()