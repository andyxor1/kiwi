import { setup, teardown, getFile } from '../jest/test.utils'

let chromeless = null

beforeAll(() => { chromeless = setup() })
afterAll(async () => { await teardown(chromeless) })

test('+++ home renders correctly', async () => {
  const html = await chromeless
    .goto(global.config.baseUrl)
    .wait('div#root')
    .evaluate(() => document.querySelector('div#root').innerHTML)
  expect(html).toMatchSnapshot()
})

test('+++ home renders correctly (visual)', async () => {
  const screenshotPath = await chromeless
    .goto(global.config.baseUrl).wait('div#root').screenshot()
  const screenshot = await getFile(screenshotPath)
  expect(screenshot).toMatchImageSnapshot()
})