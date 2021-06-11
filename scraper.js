import dotenv from 'dotenv'
import puppeteer from 'puppeteer-extra'
import StealthPlugin from 'puppeteer-extra-plugin-stealth'
// import RecaptchaPlugin from 'puppeteer-extra-plugin-recaptcha'

dotenv.config()

// const apiToken = process.env['API_TOKEN']
const drivingLicenceNumber = process.env['DRIVING_LICENCE_NUMBER']
const theoryTestPassNumber = process.env['THEORY_TEST_PASS_NUMBER']
const timeoutDuration = 240000

puppeteer.use(StealthPlugin())

// puppeteer.use(
//   RecaptchaPlugin({
//     provider: { id: '2captcha', token: apiToken },
//     visualFeedback: true , // colorize reCAPTCHAs (violet = detected, green = solved)
//     solveInactiveChallenges: true
//   })
// )

const chromeOptions = {
  executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  headless: false, 
  slowMo: 30,
  defaultViewport: null
  // ,
  // args: [
  //   '--disable-features=IsolateOrigins,site-per-process',
  //   '--flag-switches-begin --disable-site-isolation-trials --flag-switches-end'
  // ]
}

// puppeteer usage as normal
puppeteer.launch(chromeOptions).then(async browser => {
  try {
    const page = await browser.newPage()

    await page.goto('https://driverpracticaltest.dvsa.gov.uk/login')
  
    // ? are there also invisible recaptchas tripping this up once logged in?
    // That's it, a single line of code to solve reCAPTCHAs 🎉
    // await page.solveRecaptchas()

    // * problem i have now i that there are multiple iframe captchas, plugin strggles to solves them every time. 
    // ! recaptchas appear in frames, not the main page, therefore need a work around,see below
    // Loop over all potential frames on that page
    // for (const frame of page.mainFrame().childFrames()) {
    //   // Attempt to solve any potential captchas in those frames
    //   // await frame.waitForNavigation({ timeout: timeoutDuration })
    //   // ! cant use waitForNavigation, as frame get detached
    //   // ! maybe it deached before 2captcha can engage, need a way to log whenever a captcha comes up.
    //   await frame.solveRecaptchas()
    // }

    // Wait to leave server queue
    await page.waitForNavigation({ timeout: timeoutDuration })

    // delay to give time for necessary DOM content to load
    await page.waitForTimeout(1000)

    // handle login form
    await page.waitForSelector('#driving-licence-number', { timeout: timeoutDuration })
    await page.type('#driving-licence-number', drivingLicenceNumber)
    await page.click('#use-theory-test-number')
    await page.type('#theory-test-pass-number', theoryTestPassNumber)
    await page.click('#booking-login')

    // ! this is where things start to go wrong, cant get past google captcha every time. just have ot hope it doesnt get triggered by my bot.
    // ! puppeteer clicks are not being trated like user clicks. 
    // 1) try to avoid captcah from being triggered
    // 2) try to solve capthas as they come up
    await page.waitForTimeout(1000)
    await page.waitForSelector('#test-centre-change', { timeout: timeoutDuration })
    await page.click('#test-centre-change')

    // ! recaptcha point?
    // for (const frame of page.mainFrame().childFrames()) {
    //   await frame.solveRecaptchas()
    // }

    await page.waitForSelector('#test-choice-earliest', { timeout: timeoutDuration })
    await page.click('#test-choice-earliest')
    await page.click('#driving-licence-submit')

    // ! recaptcha point?
    // for (const frame of page.mainFrame().childFrames()) {
    //   await frame.solveRecaptchas()
    // }

    await page.waitForTimeout(1000)
    await page.waitForSelector('#test-centres-input', { timeout: timeoutDuration })
    await page.type('#test-centres-input', 'PO9 6DY')
    await page.click('#test-centres-submit')

    await page.screenshot({ path: 'availability page.png' })
  
    // * for when data has been found and mapped for a result / communicated/notified to user / process complete
    //await browser.close()
  } catch (err) {
    console.log(err)
  }
})

// ? TO DO:
// 1 scrape desination page and map through test centers to see if dates are found/not found
// 1.1 use dev tools to simlate a test slot being avilable

// 2 make app run on a schdule, a few times a day, exept when servers are closed.
// 3 communiate availability result to user, screen shot / mapped data of each test center and wether they have slots available

// EXTRA FEATURE: if slot is avaviable, make the bot book the next available slot for you. At present you ould have to login-in yourself ASAP and hope the slot is still available. 


