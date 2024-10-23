import { StatusCodes } from "http-status-codes"
import { urlMap } from "../../../../../app/utils/url-mappings"
import { interceptRequest } from "../../../page-objects/utils"
import LoginPageObject from "../../../page-objects/auth/login/login_page_object"
import RegisterPageObject, {userRegistrationDetails} from "../../../page-objects/auth/register/register_page_object"

// const cypress_test_with = Cypress.env('CYPRESS_TEST_WITH');
const loginPage = new LoginPageObject()
const registerPage = new RegisterPageObject()

describe('Login page', () => {
    let userDts: userRegistrationDetails;

    before(() => {
        userDts = registerPage.generateRegistrationFormFields()
    })

    it("should register and login user with valid credentials", () => {
        loginPage.completeRegisterAndLoginUser(userDts)
        loginPage.logoutTheLoggedInUser()
    })

    it("should login user with valid email", () => {
        loginPage.completeUserLogin(userDts.email, userDts.password)
        loginPage.logoutTheLoggedInUser()
    })

    it("should fail to login with invalid username", () => {
        loginPage.completeUserLoginWithError({
            username: `${userDts.username}wrong`, password: userDts.password, statusCode: StatusCodes.FORBIDDEN
        })
    })

    it("should fail to login with invalid email", () => {
        loginPage.completeUserLoginWithError({
            username: `wrong${userDts.email}`, password: userDts.password, statusCode: StatusCodes.FORBIDDEN
        })
    })

    it("should fail to login with invalid password", () => {
        loginPage.completeUserLoginWithError({
            username: userDts.username, password: `wrong${userDts.password}`, statusCode: StatusCodes.UNAUTHORIZED
        })
    })

    it("should show an alert message if there is an error when user is trying to logout", () => {
        // TODO : change the session fid
        // TODO : verify that the alert message is displayed
        const requestName = "logoutRequest"
        const {mocked} = interceptRequest({
            requestName,
            method: "POST",
            url: urlMap.serverAuth.logout,
            statusCode: StatusCodes.UNAUTHORIZED,
            body: {msg: 'okay', cause: 'logout successful from mocked database'}
        })

        // log the user in
        loginPage.completeUserLogin(userDts.email, userDts.password)

        // updates the session fid in the localStorage - this should result in an error
        cy.window().then(win => {
            const loggedInfo = JSON.parse(win.localStorage.getItem('userDts') as string)
            win.localStorage.setItem('userDts', JSON.stringify({...loggedInfo, session_fid: 'wrongSessionFid'}));
        })

        // Stub the alert method - this should be called with an error message
        const stub = cy.stub()  
        cy.on('window:alert', stub)

        // visit the logout page
        cy.visit(urlMap.clientAuth.logout)

        // if we are using the MOCK_DATABASE, wait for the request to complete
        if (mocked) cy.wait(`@${requestName}`);

        // verify that the logout was not successful
        cy.wait(5000).then(() => {
            expect(stub.getCall(0)).to.be.calledWith('Request failed with status code 401')
        })

    })
})