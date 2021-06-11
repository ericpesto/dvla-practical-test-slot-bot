import dotenv from 'dotenv'
import puppeteer from 'puppeteer-extra'
import StealthPlugin from 'puppeteer-extra-plugin-stealth'

dotenv.config()

// You must have Buster Chrome extension downlaoded to Chrome for reCAPTCHA busting.
const pathToExtension = '~/Library/Application Support/Google/Chrome/Default/Extensions/mpbjkejclgfgadiemmefgebjfooflfhl/1.2.0_0'

// .env variables for hiding sensitive info
const drivingLicenceNumber = process.env['DRIVING_LICENCE_NUMBER']
const theoryTestPassNumber = process.env['THEORY_TEST_PASS_NUMBER']

// application global variables
const timeoutDuration = 240000

puppeteer.use(StealthPlugin())

const customArgs = [
  `--disable-extensions-except=${pathToExtension}`,
  `--load-extension=${pathToExtension}`,
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

// launch puppetteer
puppeteer.launch(chromeOptions).then(async browser => {
  try {

    const page = await browser.newPage()
    await page.goto('https://driverpracticaltest.dvsa.gov.uk/login')





    // * must simulate user clicks on captcha feilds in frames, if captcha is visible. cant target those elemts atm.
    // ! need to target the dom of hte recaptcha iframe in orer to siultae clicks that the busted extension needs
    // for (const frame of page.mainFrame().childFrames()) {
    //   console.log(await frame)
    //   await frame.waitForNavigation({ timeout: timeoutDuration }),
    //   await frame.waitForSelector('#rc-anchor-container', { timeout: timeoutDuration } )
    //   await frame.click('#rc-anchor-container')
    // }




    // Wait to leave server queue
    await page.waitForNavigation({ timeout: timeoutDuration })
    await page.waitForTimeout(1000)
    await page.screenshot({ path: '1.png' })

    // handle login form
    await page.waitForTimeout(1000)
    await page.waitForSelector('#driving-licence-number', { timeout: timeoutDuration })
    await page.type('#driving-licence-number', drivingLicenceNumber)
    await page.click('#use-theory-test-number')
    await page.type('#theory-test-pass-number', theoryTestPassNumber)
    await page.click('#booking-login')
    await page.screenshot({ path: '2.png' })

    // next page actions
    await page.waitForTimeout(1000)
    await page.waitForSelector('#test-centre-change', { timeout: timeoutDuration })
    await page.click('#test-centre-change')
    await page.screenshot({ path: '3.png' })

    // next page actions
    await page.waitForTimeout(1000)
    await page.waitForSelector('#test-choice-earliest', { timeout: timeoutDuration })
    await page.click('#test-choice-earliest')
    await page.click('#driving-licence-submit')
    await page.screenshot({ path: '4.png' })

    // next page actions
    await page.waitForTimeout(1000)
    await page.waitForSelector('#test-centres-input', { timeout: timeoutDuration })
    await page.type('#test-centres-input', 'PO9 6DY')
    await page.click('#test-centres-submit')
    await page.screenshot({ path: '5.png' })
  
    // * for when data has been found and mapped for a result / communicated/notified to user / process complete
    //await browser.close()
  } catch (err) {
    console.log(err)
  }
})

// ? TO DO:
// * must simulate user clicks on captcha feilds, if captcha is visible.
// 1 scrape desination page and map through test centers to see if dates are found/not found
// 1.1 use dev tools to simlate a test slot being avilable

// 2 make app run on a schdule, a few times a day, exept when servers are closed.
// 3 communiate availability result to user, screen shot / mapped data of each test center and wether they have slots available

// EXTRA FEATURE: if slot is avaviable, make the bot book the next available slot for you. At present you ould have to login-in yourself ASAP and hope the slot is still available. 