const { join } = require('path');
const puppeteer = require('puppeteer-core');
const listenCrash = require('./listenCrash');
const servicesStatus = require('./servicesStatus');
const weblog = require('./weblog');
const utils = require('./utils');

const width = 1920;
const height = 1080;
const options = {
  headless: false,
  executablePath: utils.chromePath(),
  args: [
    '--autoplay-policy=no-user-gesture-required',
    '--enable-usermedia-screen-capturing',
    '--allow-http-screen-capture',
    '--remote-debugging-port=9222',
    '--whitelisted-extension-id=cnlcagjlokccajjeehpfccjlkgflmmgj',
    `--load-extension=${join(__dirname, '..', 'dist')}`,
    `--disable-extensions-except=${join(__dirname, '..', 'dist')}`,
    '--disable-infobars',
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--disable-dev-shm-usage',
    `--window-size=${width},${height}`,
    '--unsafely-treat-insecure-origin-as-secure=http://127.0.0.1',
    `--user-data-dir=${utils.userDataPath()}`,
  ]
};

module.exports = async () => {
  const browser = await puppeteer.launch(options);
  const pages = await browser.pages();
  const page = pages[0];
  await page.goto('http://127.0.0.1');
  weblog.sendLog('chrome.open');
  listenCrash();

  // 正常关闭
  page.on('close', () => {
    weblog.sendLog('chrome.close');
    servicesStatus.setChromeClose = true;
  });

  // 当主页面崩溃时
  page.on('error', () => {
    weblog.sendLog('chrome.main.crash');
    servicesStatus.setChromeError = true;
  });
};
