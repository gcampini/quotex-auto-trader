const Predictor = require('./predictor');

/**
 * Predictor qui suit la tendance.
 */
class TrendPredictor extends Predictor {

    predict(input) {
        if (!this.ready) {
            throw new Error("Predictor not ready");
        }
        const {bets} = input.past;
        let prediction = this.options.firstInvestmentVariation;
        if (bets.length > 0 && bets[0].finished) {
            if (bets[0].state === "win") prediction = bets[0].bet;
            else prediction = bets[0].bet === "down" ? "up" : "down";
        }
        return {
            investment: this.investments[this.getInvestmentLevel(input.past.bets)].roundedInvestment,
            prediction,
        };
    }

}

module.exports = TrendPredictor;