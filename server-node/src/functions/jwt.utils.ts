import jwt from "jsonwebtoken";

// i had some issues with the previous private key that i used. it was not upto 2048bit and did not meet the standard requirements for jwt RS256...
// if found a site for the generation of this public and private key - https://travistidwell.com/jsencrypt/demo/
// after jwt.sign, an access token is generated, this token can be verified @ the jwt.io website, just paste the access token into the encoded and then you'll see the decoded payload
const privateKey = `
-----BEGIN RSA PRIVATE KEY-----
MIIEowIBAAKCAQEApP2yM7MUNbp3lmyavS346XPRo7TmC6QTFo571JR9Bp1ZI8Iy
/G3ZWjvOP5tQWFKu+RPqhx7iPWYH7N3Wt0EAv3O1TPk5S/Aqg62nbX4MNIxCqC3X
jxShFhpVAX8WUA8eWpocIzsV/EqlU11HhvrauDta8lLGgy/N02LJJL+rV7WYG3Bn
+lxF7Y572XZfhrXxYpNiqVJWG5FFrBAGwRMwlrJONhcMTopWoT3MRqDHR7MDJskA
XL0JsS+wTqZnQeUmSAL/b69KUbwjhuPPAtPmtxXZ16HKEEDqaWWPMlfN8L/MIPOF
xGPXi+6601He0PYdCrZweDj2vp3BC6k/W9FpdwIDAQABAoIBACK96RBJ3S+THCto
owzC6W7/HF3EccxxuDM/vYN94PXLnEGTWvkciHAft8ZdBgYTIxT/xJq/PhR/r5uI
+vWLkoS98KdMs2vyHoGrx12e9SL7he2z+Xf/eAwXb17pS+F/zXx2hwZEItUFQtrT
AYTCvdudZAEyvOpS3pxsaL58PbAyDTYj4+KFeh88f30orIeIRt1q0k+45r2uQT35
WhKy5vJejCA6Bj9cM2z96xpByXcddOMFWeTp5p6Xo6d/2uCfTA/ZtdYvv2otEH57
FWj3/BGd3u3mz6XeV1OsH7amSexwglSPJZePutbsVgApfNoqKBhti/0XRyudjcDI
+Rl8MkECgYEA8QVv6MP4lFIUwCKv+XkVf8573b/KMsEobGSsDq1WmvvU3IfahPfN
NIlaX+T9F+Y+egQxErC5SDhvRYDrvJ2Uu4ud/LvA4X54tyB6BnvZ89Deqolw0ZsB
/k8F565KjK00nU0YHX8EbdijRaWOJQJZko7z8bU7T9m5Bv2bsdinQ6UCgYEArz6l
CphP3qKf5a6cElk5etKKF+9ojmFKvgrK9jiY77zlfGN5Z0HqpF8ZJP613rSVHFhG
XMkuIl8cFx5llgEtAmwl+yLV0ZBlzdY+rGdEDusTtKb62Q68FJSYlFHtfEdba0h6
A2EGnybFDyP6sPu+x+AgNKiDlVQcNIU/FdoIPesCgYAeg2q0lELfPDkGTh3rPoob
QR/rZgGKRWwBtQkXXpiNTH6ZYNWoadrf4NfBNjNYmDymo+s2i4sZepOTwAuYOHcA
+18IBRkZMzLDNGhec8WXGYVnH7lZv/8TnBuKRkWH49G6bG02JsN/yKJ7CceiJdcD
N/foTOJybIUBPpA8hso+RQKBgAKShtWq+rEn7fTvJTdXu/JDmOdVClHct74mZmhK
2GPcf/ndc/DCFPGou7PBUWYdfHrYCOBfy5+RidYFCjSze7enYr9W+ZCD8BqfZHgf
Y+5cIQPr147MGpKqw7qZoUTLv1nJzJC0IebAKPBZ9NoYN+qzLYXYW2Ybv/Y9Znmp
o6lVAoGBAIvNg0xgAdpVuW4GTBQNKln7ZTN7mai2LCJfU9A/gJC/cg9EAdHIglwj
IGKHifC8FtmJyjJf4RaPk92YpFtB5l6OnQ3/ewPBGutZaKdGL//fYNY9yat/xprG
7v8WiZ3EfYHXz6BWJu9pAuWx+Dzz+EnAQuU2yRiMR1GHjANnQehk
-----END RSA PRIVATE KEY-----`;

const publicKey = `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEApP2yM7MUNbp3lmyavS34
6XPRo7TmC6QTFo571JR9Bp1ZI8Iy/G3ZWjvOP5tQWFKu+RPqhx7iPWYH7N3Wt0EA
v3O1TPk5S/Aqg62nbX4MNIxCqC3XjxShFhpVAX8WUA8eWpocIzsV/EqlU11Hhvra
uDta8lLGgy/N02LJJL+rV7WYG3Bn+lxF7Y572XZfhrXxYpNiqVJWG5FFrBAGwRMw
lrJONhcMTopWoT3MRqDHR7MDJskAXL0JsS+wTqZnQeUmSAL/b69KUbwjhuPPAtPm
txXZ16HKEEDqaWWPMlfN8L/MIPOFxGPXi+6601He0PYdCrZweDj2vp3BC6k/W9Fp
dwIDAQAB
-----END PUBLIC KEY-----`;

// sign jwt
export function signJWT(payload: object, expiresIn: string | number) {
    return jwt.sign(payload, privateKey, { algorithm: "RS256", expiresIn });
}

// verify jwt
export function verifyJWT(token: string) {
    // the jwt.verify was wrapped in a try {} catch block because, if jwt.verify is not able to verify a token, it throws an error and this can crash our application
    try {
        const decoded = jwt.verify(token, publicKey);
        return { payload: decoded, expired: false };
    } catch (error: any) {
        return { payload: null, expired: error.message.includes("jwt expired") };
    }
}
  