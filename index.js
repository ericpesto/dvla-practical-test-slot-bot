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

// You must have Buster Chrome extension downlaoded to Chrome for reCAPTCHA busting.
const pathToExtension = '~/Library/Application Support/Google/Chrome/Default/Extensions/mpbjkejclgfgadiemmefgebjfooflfhl/1.2.0_0'

// .env variables for hiding sensitive info
const drivingLicenceNumber = process.env['DRIVING_LICENCE_NUMBER']
const theoryTestPassNumber = process.env['THEORY_TEST_PASS_NUMBER']

// application global variables
const timeoutDuration = 240000
const clickDelay = 30

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

const checkWebsite = async() => {
  // launch puppetteer
  const browser = await puppeteer.launch(chromeOptions)
  const page = await browser.newPage()
  await page.goto('https://driverpracticaltest.dvsa.gov.uk/login')

  try {
    const frame = page.frames().find((frame) => frame.name() === 'main-iframe')
    console.log('frame', frame)
    console.log('page.mainFrame() ->', page.mainFrame())
    console.log('page.mainFrame() ->', frame.childFrames())
    // const recaptchaButton = await frame.$eval('rc-anchor-container', (element) => element.textContent)
    // console.log(recaptchaButton)
  } catch (err) {
    console.log(err)
  }

  try {
    // Wait to leave server queue
    await page.waitForNavigation({ timeout: timeoutDuration })
    await page.waitForTimeout(1000)
    await page.screenshot({ path: '1.png' })

    // * page nav
    try {
      const frame = page.frames().find((frame) => frame.name() === 'main-iframe')
      console.log('frame', frame)
      console.log('page.mainFrame() ->', page.mainFrame())
      console.log('page.mainFrame() ->', frame.childFrames())
      // const recaptchaButton = await frame.$eval('rc-anchor-container', (element) => element.textContent)
      // console.log(recaptchaButton)
    } catch (err) {
      console.log(err)
    }

    // handle login form
    await page.waitForTimeout(1000)
    await page.waitForSelector('#driving-licence-number', { timeout: timeoutDuration })
    await page.type('#driving-licence-number', drivingLicenceNumber)
    await page.click('#use-theory-test-number', { delay: clickDelay  })
    await page.type('#theory-test-pass-number', theoryTestPassNumber)
    await page.click('#booking-login', { delay: clickDelay  })
    await page.screenshot({ path: '2.png' })

    // * page nav
    try {
      const frame = page.frames().find((frame) => frame.name() === 'main-iframe')
      console.log('frame', frame)
      console.log('page.mainFrame() ->', page.mainFrame())
      console.log('page.mainFrame() ->', frame.childFrames())
      // const recaptchaButton = await frame.$eval('rc-anchor-container', (element) => element.textContent)
      // console.log(recaptchaButton)
    } catch (err) {
      console.log(err)
    }

    // next page actions
    await page.waitForTimeout(1000)
    await page.waitForSelector('#test-centre-change', { timeout: timeoutDuration })
    await page.click('#test-centre-change', { delay: clickDelay  })
    await page.screenshot({ path: '3.png' })

    // * page nav
    try {
      const frame = page.frames().find((frame) => frame.name() === 'main-iframe')
      console.log('frame', frame)
      console.log('page.mainFrame() ->', page.mainFrame())
      console.log('page.mainFrame() ->', frame.childFrames())
      // const recaptchaButton = await frame.$eval('rc-anchor-container', (element) => element.textContent)
      // console.log(recaptchaButton)
    } catch (err) {
      console.log(err)
    }

    // next page actions
    await page.waitForTimeout(1000)
    await page.waitForSelector('#test-choice-earliest', { timeout: timeoutDuration })
    await page.click('#test-choice-earliest', { delay: clickDelay  })
    await page.click('#driving-licence-submit', { delay: clickDelay  })
    await page.screenshot({ path: '4.png' })

    // * page nav
    try {
      const frame = await page.frames().find((frame) => frame.name() === 'main-iframe')
      console.log('frame', frame)
      console.log('page.mainFrame() ->', page.mainFrame())
      console.log('page.mainFrame() ->', frame.childFrames())
      // const recaptchaButton = await frame.$eval('rc-anchor-container', (element) => element.textContent)
      // console.log(recaptchaButton)
    } catch (err) {
      console.log(err)
    }
  
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

// * must simulate user clicks on captcha feilds in iframes, if captcha is visible. cant target those elemts atm.
// ! need to target the dom of hte recaptcha iframe in orer to siultae clicks that the busted extension needs
// for (const frame of page.mainFrame().childFrames()) {
//   console.log(await frame)
//   await frame.waitForNavigation({ timeout: timeoutDuration }),
//   await frame.waitForSelector('#rc-anchor-container', { timeout: timeoutDuration } )
//   await frame.click('#rc-anchor-container')
// }

// for (const frame of page.mainFrame().childFrames()){
//   // Here you can use few identifying methods like url(),name(),title()
//   if (frame.url().includes('twitter')){
//     console.log('we found the Twitter iframe')
//     twitterFrame = frame 
//     // we assign this frame to myFrame to use it later
//   }
// }
// let frame
// console.log(await page.frames())
// frame = await page.frames().find(f => f.name() === 'c-lc4afuax3drl')
// // const button = await frame.$('button')
// // button.click()
// console.log('frame ->', await frame)

// const frame = await page.frames().find(f => f.url().startsWith('https://www.google.com/recaptcha/api2/'))
// console.log(frame)
