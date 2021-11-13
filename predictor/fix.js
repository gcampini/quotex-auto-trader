const Predictor = require('./predictor');

/**
 * Predictor that always predicts the same thing.
 */
class FixPredictor extends Predictor {

    constructor(page, scraper, options, prediction) {
        super(page, scraper, options);
        this.prediction = prediction;
    }

    predict(input) {
        if (!this.ready()) {
            throw new Error("Predictor not ready");
        }
        return {
            investment: this.investments[this.getInvestmentLevel(input.past.bets)].roundedInvestment,
            prediction: this.prediction
        };
    }

}

module.exports = FixPredictor;