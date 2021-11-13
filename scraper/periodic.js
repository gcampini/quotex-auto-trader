const Scraper = require('./scraper');

class PeriodicScraper extends Scraper {

    constructor(page) {
        super(page);
        this.interval = null;
    }

    start() {
        if (this.interval) stop();
        setInterval(() => {
            this.scrape();
        }, this.interval);
    }

    stop() {
        clearInterval(this.interval);
    }

}

module.exports = PeriodicScraper;