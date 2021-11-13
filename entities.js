class Period {

    /**
     *
     * @param {number} min
     * @param {number} max
     * @param {String} startTime
     * @param {String} endTime
     * @param {number} startValue
     * @param {number} endValue
     */
    constructor(min, max, startTime, endTime, startValue, endValue) {
        this.min = min;
        this.max = max;
        this.startTime = startTime;
        this.endTime = endTime;
        this.startValue = startValue;
        this.endValue = endValue;
    }

    /**
     * The pips of the period.
     *
     * @return {number}
     */
    get pips() {
        return this.endValue - this.startValue;
    }

    /**
     * @return {("up"|"down"|"eq")} movement
     */
    get movement() {
        return this.pips > 0 ? 'up' : this.pips < 0 ? 'down' : 'eq';
    }

}

class Bet {

    /**
     *
     * @param {String} startTime
     * @param {String} endTime
     * @param {number} startValue
     * @param {number|null} endValue
     * @param {"up" | "down"} bet
     * @param {number} investment
     */
    constructor(startTime, endTime, startValue, endValue, bet, investment) {
        this.startTime = startTime;
        this.endTime = endTime;
        this.startValue = startValue;
        this.endValue = endValue;
        this.bet = bet;
        this.investment = investment;
    }

    /**
     * @return {"win"|"lose"|"draw"|null}
     */
    get state() {
        if (!this.finished) {
            return null;
        }
        if (this.startValue === this.endValue) {
            return "draw";
        }
        if (this.bet === "up") {
            return this.startValue < this.endValue ? "win" : "lose";
        }
        return this.startValue > this.endValue ? "win" : "lose";
    }

    get finished() {
        return this.endValue !== null;
    }

}

module.exports = {
    Period,
    Bet
};