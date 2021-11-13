const SELECTORS = require('../selectors');
const {Bet} = require("../entities");

/**
 * Responsible for scraping the data from the website.
 */
class Scraper {

    /**
     *
     * @param {Page} page
     */
    constructor(page) {
        this.page = page;
        this.ready = false;
        this.data = {};
        this.eventListeners = {};

        (async () => {
            await this.openPairInformationModal();
            // scraper is now ready
            this.ready = true;
        })();
    }

    async openPairInformationModal() {
        await this.page.waitForSelector(SELECTORS.pairInformationButton);
        await this.page.click(SELECTORS.pairInformationButton);
        await this.page.waitForSelector(SELECTORS.pairInformationModal);
        await this.page.$eval(SELECTORS.pairInformationModal, element => element.style.transform = 'scale(0)');
    }

    async scrape() {
        if (!this.ready) {
            throw new Error("Scraper is not ready");
        }

        /**
         * Current time in milliseconds.
         *
         * @type {string}
         */
        const time = await this.page.$eval(SELECTORS.time, element => element.innerText);
        const isoDate = new Date().toISOString().split('T')[0] + 'T' + time.split(' ')[0];
        this.setData('time', Date.parse(isoDate));

        // Bets
        const bets = (await this.page.$$eval(SELECTORS.bet, (elements) => elements.map(element => {
            const items = element.querySelectorAll('.trades-list-item__details-content__text');

            const finishedBet = items.length === 8;

            const startTime = items[finishedBet ? 4 : 3].innerText;
            const endTime = items[5].innerText;
            const startValue = parseFloat(items[2].innerText);
            const endValue = parseFloat(items[3].innerText);

            const deltaElement = element.querySelector('.trades-list-item__delta');
            const sens = deltaElement.className.endsWith('down') ? 'down' : 'up';
            const investment = parseFloat(deltaElement.textContent.split(' €')[0]);

            return {
                startTime,
                endTime: finishedBet ? endTime : null,
                startValue,
                endValue: finishedBet ? endValue : null,
                sens,
                investment
            };
        }))).map(bet => new Bet(bet.startTime, bet.endTime, bet.startValue, bet.endValue, bet.sens, bet.investment));
        this.setData('bets', bets);

        // Payout
        const payout = parseFloat((await this.page.$eval(SELECTORS.payout, po => po.textContent)).replace('%', ''));
        this.setData('payout', payout);

        /**
         * Current value of the pair.
         *
         * @type {number}
         */
        const currentPairValue = parseFloat((await this.page.$eval(SELECTORS.currentPairValue, element => element.textContent)).replace(',', '.'));
        this.setData('currentPairValue', currentPairValue);

    }

    setData(name, value) {
        let changed = false;
        if ((this.data[name] && this.data[name].length !== undefined && value && value.length !== undefined && this.data[name].length !== value.length)
            || this.data[name] !== value) {
            changed = true;
        }
        this.data[name] = value;
        if (changed && this.eventListeners[name]) {
            this.eventListeners[name].forEach(listener => listener(value));
        }
    }

    listen(name, listener) {
        if (!this.eventListeners[name]) {
            this.eventListeners[name] = [];
        }
        this.eventListeners[name].push(listener);
    }

    unlisten(name, listener) {
        if (!this.eventListeners[name]) {
            return;
        }
        const index = this.eventListeners[name].indexOf(listener);
        if (index !== -1) {
            this.eventListeners[name].splice(index, 1);
        }
    }

}

module.exports = Scraper;