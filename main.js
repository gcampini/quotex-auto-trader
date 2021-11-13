const puppeteer = require('puppeteer-core');

const SELECTORS = require('./selectors');

const Scraper = require('./scraper/scraper');
const SimplePredictor = require('./predictor/trend');

(async () => {

    const browser = await puppeteer.launch({
        executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
        headless: false,
        defaultViewport: null
    });

    const page = await browser.newPage();

    // Connexion
    await page.goto('https://quotex.io/fr/sign-in');
    await page.type('.active .modal-sign__input-value[type=email]', 'campinigil@gmail.com');
    await page.type('.active .modal-sign__input-value[type=password]', 'HNbxbDmt7ikgnZXCxEyg');
    await page.click('.active .modal-sign__block-button');

    // Attend que la page se charge et aller en démo
    await page.waitForSelector(SELECTORS.pairInformationButton);
    await page.goto('https://quotex.io/fr/demo-trade');

    const scraper = new Scraper(page);

    const predictor = new SimplePredictor(page, scraper, {
        minPayout: 90,
        bank: 10000,
        investment: 1,
        firstInvestmentVariation: "down"
    });

    let predicting = false;

    scraper.listen('bets', async bets => {
        if (bets.length === 0) {
            function onTimeChanged(time) {
                const date = new Date(time);
                if (date.getSeconds() === 0) {
                    predictor.predict();
                    scraper.unlisten('time', onTimeChanged);
                }
            }
            scraper.listen('time', onTimeChanged);
        }
        const mostRecentBet = bets[0];
        // The bet has been placed
        if (!mostRecentBet.finished && predicting) {
            predicting = false;
        }
        // On a le résultat du dernier pari donc on peut faire des prédictions sur la prochaine période
        if (mostRecentBet.finished && !predicting) {
            predicting = true;

            const input = {
                past: {
                    bets,
                    periods: []
                },
                current: {
                    value: scraper.data.currentPairValue
                }
            }

            // Predicting
            const nextBet = predictor.predict(input);
            await predictor.setInvestment(nextBet.investment);
            const buttonSelector = SELECTORS[nextBet.prediction + 'Button'];
            // Logging TODO
            // console.log(scraper.length + ' - mise ' + INVESTMENTS[level].roundedInvestment + '€ ' + predictions[0] + ' (level ' + (level * 1 + 1) + '/' + INVESTMENTS.length + ' max = ' + (maxLevel * 1 + 1) + ')');
            // Betting
            await page.click(buttonSelector);
        }
    });

    // scrape periodically
    setInterval(async () => {
        if (!scraper.ready) return;
        await scraper.scrape();
    }, 100);

})();
