import express from 'express'
import logger from './logger';
import itemRoutes from '../routes/item';
import userRoutes from '../routes/user';
import catchAll from '../routes/catchAll';

const errorHandler: express.ErrorRequestHandler = (err, req, res, next) => {
    if (res.headersSent) {
        // Too late to send error to user
        return next(err)
    }
    logger.info(`Request Error in: ${req.method} ${req.url} params:${JSON.stringify(req.params)}`)
    logger.error(err.stack)
    res.status(err.status || 400)
    return res.send({ error: err })
}

class ExpressApp {
    public app: express.Application
    private static _instance: ExpressApp

    constructor () {
        this.app = express()
        this.mountRoutes()
    }

    public static getInstance(): express.Application {
        if (!this._instance) {
            this._instance = new ExpressApp()
        }

        return this._instance.app
    }

    private mountRoutes (): void {
        let router: express.Router = express.Router()
        logger.info('defining endpoints')

        router = itemRoutes(router)
        router = userRoutes(router)
        // Add more route files here or automate
        router = catchAll(router)

        this.app.use('/', router)

        this.app.use(errorHandler)
    }
}

export default ExpressApp.getInstance()