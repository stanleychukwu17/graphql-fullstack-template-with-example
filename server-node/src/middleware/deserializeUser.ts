import { NextFunction, Request, Response } from "express";
import { signJWT, verifyJWT } from "../functions/jwt.utils";
import { get_this_session_details } from "../controllers/users.controller";

async function deserializeUser(req: Request, res: Response, next: NextFunction) {
    let { accessToken, refreshToken, session_fid } = req.query;

    // if the access token and refresh token are not in the req.query(GET request), then we try to see if we can get them from the req.body(POST request)
    if (!accessToken && !refreshToken) {
        accessToken = req.body.accessToken
        refreshToken = req.body.refreshToken
        session_fid = req.body.session_fid
    }

    // no access token, we move!
    if (!accessToken) {
        return next();
    }

    const { payload, expired } = verifyJWT(accessToken as string);

    // the session_fid received from the request should be the same as the one from the payload
    if (expired === false) { // this means the accessToken is still valid
        //@ts-ignore
        if (payload.session_fid != session_fid) {
            return next()
        }
    
        // get the session details and makes sure the session is active
        const session_dts = await get_this_session_details(session_fid as unknown as number)
        const user_id = session_dts.user_id
    
        // For a valid access token
        if (payload && user_id > 0) {
            // @ts-ignore
            req.loggedInDts = {session_fid, user_id}
            req.body.loggedInDts = {session_fid, user_id};
            return next()
        }
    }

    // expired accessToken, but user has a valid refreshToken
    const { payload: refresh } = expired && refreshToken ? verifyJWT(refreshToken as string) : { payload: null };
    if (!refresh) {
        return next();
    }

    // @ts-ignore
    const session = await get_this_session_details(refresh.session_fid as unknown as number)
    const user_id = session.user_id
    if (session.num_rows <= 0 || user_id <= 0) { // meaning an invalid session_fid was passed
        return next();
    }

    // creates a new access token
    const newAccessToken = signJWT({session_fid}, process.env.JWT_TIME_1 as string);

    // gets the user information from the new access token created
    const user = verifyJWT(newAccessToken).payload;
    const loggedInDts = {session_fid, user_id, new_token:'yes', newAccessToken}

    // attaches the user logged in details to the req, so that is can be available to all
    // @ts-ignore
    req.loggedInDts = loggedInDts;
    req.body.loggedInDts = loggedInDts;

    return next();
}
  
export default deserializeUser;