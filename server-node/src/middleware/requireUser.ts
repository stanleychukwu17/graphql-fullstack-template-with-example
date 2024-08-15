import { NextFunction, Request, Response } from "express";

export function requireUser(req: Request, res: Response, next: NextFunction) {
    // @ts-ignore
    if (!req.loggedInDts || req.loggedInDts.user_id <= 0) {
        return res.json({'msg':'bad', 'action':'logout', 'from':'requireUser middleware', 'cause':'Please re-login to your account to continue'});
    }
  
    return next();
}