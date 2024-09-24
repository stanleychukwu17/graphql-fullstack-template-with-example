import { Express, Request, Response, NextFunction } from "express";
import {register_a_new_user, login_this_user, logout_this_user} from './controllers/users.controller'
import {log, errorLogger} from './logger/'
import {show_bad_message, show_good_message } from "./functions/utils";
import { requireUser } from "./middleware/requireUser";

const routes = (app: Express) => {
    // checks to see if our servers are running as they should
    app.get('/healthCheck', (req, res) => {
        const currentFilename = __filename;
        log.info({currentFilename}, 'checking my log')
        res.json('its all good')
    })

    // healthCheck for accessToken and refreshToken
    app.post('/healthCheck/accessToken', requireUser, (req, res) => {
        let returnMsg = {}

        if (req.body.loggedInDts.loggedIn === true) {
            //@ts-ignore
            const new_token = req.body.loggedInDts.new_token || ''
            if (new_token === 'yes') {
                returnMsg = {
                    msg: "okay",
                    new_token,
                    dts: {
                        accessToken: req.body.loggedInDts.newAccessToken
                    }
                }
            } else {
                returnMsg = show_good_message()
            }
        } else {
            returnMsg = show_bad_message("accessToken & refreshToken are no longer valid")
        }

        res.json(returnMsg)
    })

    //--START-- routes for users
    // this route registers a new user
    app.post('/users/new_user', async (req: Request, res: Response) => {
        const dts = await register_a_new_user(req.body)
        res.json(dts)
    })

    // this route logsIn a new user
    app.post('/users/login', async (req: Request, res: Response) => {
        const dts = await login_this_user(req.body)
        res.json(dts)
    })

    // this route logout the user
    app.post('/users/logout', async (req: Request, res: Response) => {
        const dts = await logout_this_user(req.body)
        res.json(dts)
    })
    //--END--
}

export default routes