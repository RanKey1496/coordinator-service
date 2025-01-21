import App from './app';

process.on('uncaughtException', (err) => {
    console.error(`
    --------------------
    Unhandled Exception:
    ${err.message}
    --------------------
    `);
});

process.on('unhandledRejection', (err) => {
    console.error(`
    --------------------
    Unhandled Rejection:
    ${err}
    --------------------
    `);
});

const app: App = new App();
app.start();
module.exports = app;