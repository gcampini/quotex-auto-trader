const SELECTORS = require('../selectors');

/**
 * Interface for the predictor.
 *
 * @author Gil CAMPINI
 */
class Predictor {

    /**
     * Constructor.
     *
     * @param {Page} page
     * @param {Scraper} scraper
     * @param {{
     *     minPayout: number,
     *     bank: number,
     *     investment: number,
     *     firstInvestmentVariation: "down" | "up",
     * }} options
     */
    constructor(page, scraper, options) {
        this.page = page;
        scraper.listen('payout', (payout) => this.computeInvestments(payout));
        this.options = options;
        this.investments = [];
    }

    /**
     * Predict the next bet.
     *
     * @param {{
     * past: {
     *  bets: [Bet],
     *  periods: [Period]
     * },
     * current: {
     *      bet: Bet|null,
     *      period: Period,
     *      value: number,
     * }
     * }} input
     *
     * @returns {{
     * investment: number,
     * prediction: ("down" | "up" | "eq"),
     * }}
     */
    predict(input) {
        throw new Error("Not implemented");
    }

    /**
     * Set the investment value.
     *
     * @param {number} value
     * @return {Promise<void>}
     */
    async setInvestment(value) {
        await this.page.$eval(SELECTORS.investmentInput, (element) => {
            element.select();
        });
        await this.page.type(SELECTORS.investmentInput, value.toString());
    }

    /**
     * Compute the investment level based on the state of the past bets.
     *
     * @param {Bet[]} pastBets
     * @return {number}
     */
    getInvestmentLevel(pastBets) {
        let level = 0;
        if (pastBets.length === 0) {
            return level;
        }
        while (pastBets[level].state === 'lose') {
            level++;
        }
        return level;
    }

    async computeInvestments(payout) {
        let idx = 0;
        let bankAmountReached = false;

        while (!bankAmountReached) {
            let investment = idx === 0 ? this.options.investment : this.investments[idx - 1].totalInvestment / (parseFloat(payout) / 100) + this.options.investment;
            let roundedInvestment = Math.round(investment);
            let totalInvestment = idx === 0 ? investment : investment + this.investments[idx - 1].totalInvestment;
            let win = roundedInvestment + (roundedInvestment * parseFloat(payout) / 100);
            let gain = Math.round((win - totalInvestment) * 100) / 100;

            bankAmountReached = totalInvestment >= this.options.bank;

            if (!bankAmountReached) {
                this.investments.push({
                    investment: investment,
                    roundedInvestment: roundedInvestment,
                    totalInvestment: totalInvestment,
                    win: win,
                    gain: gain
                })
            }
            idx++;
        }
    }

    get ready() {
        return !!this.investments;
    }

}

module.exports = Predictor;