import { StatusCodes } from "http-status-codes"
import { urlMap } from "../../../../../app/utils/url-mappings"
import { interceptRequest } from "../../../../e2e/page-objects/utils"
import LoginPageObject from "../../../page-objects/auth/login/login_page_object"
import RegisterPageObject, {userRegistrationDetails} from "../../../page-objects/auth/register/register_page_object"

// const cypress_test_with = Cypress.env('CYPRESS_TEST_WITH');
const loginPage = new LoginPageObject()
const registerPage = new RegisterPageObject()

describe('Login page', () => {
    let userDts: userRegistrationDetails

    before(() => {
        userDts = registerPage.generateRegistrationFormFields()
    })

    it.skip("should register and login user with valid credentials", () => {
        loginPage.completeRegisterAndLoginUser(userDts)
        loginPage.logoutTheLoggedInUser()
    })

    it.skip("should login user with valid email", () => {
        loginPage.completeUserLogin(userDts.email, userDts.password)
        loginPage.logoutTheLoggedInUser()
    })

    it("should fail to login with invalid username", () => {
        loginPage.completeUserLogin(`${userDts.username}wrong`, userDts.password)
        cy.pause()
    })

    it("should fail to login with invalid email", () => {
        loginPage.completeUserLogin(`wrong${userDts.email}`, userDts.password)
    })

    it.skip("should fail to login with invalid password", () => {
        loginPage.completeUserLogin(userDts.username, `wrong${userDts.password}`)
    })

    it.skip("should fail to login if other errors from the server", () => {})
})