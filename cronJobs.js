const cron = require('node-cron');
const reserveService = require('./services/reserveService');

cron.schedule('0 1 * * *', async () => {
    console.log('Running autoReleaseReserve...');
    await reserveService.autoReleaseReserve();
});