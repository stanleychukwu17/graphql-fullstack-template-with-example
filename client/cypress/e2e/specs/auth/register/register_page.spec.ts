import { StatusCodes } from "http-status-codes"

import { urlMap } from "../../../../../app/utils/url-mappings"
import RegisterPageObject, { userRegistrationDetails } from "../../../page-objects/auth/register/register_page_object"
import { interceptRequest } from "../../../page-objects/utils"

const registerPage = new RegisterPageObject()

describe('Register page', () => {
    let userDts: userRegistrationDetails

    before(() => {
        userDts = registerPage.generateRegistrationFormFields()
    })


    it("should register with valid credentials", () => {
        // send the registration request
        const {loginLink} = registerPage.completeUserRegistration(userDts)

        loginLink.click().then(() => {
            // assert that we are on the login page
            cy.url({timeout: 10000}).should("include", urlMap.clientAuth.login)
        })
    })

    it("should fail to register if the username or email already exists", () => {
        // Intercept the login request and provide a custom response
        const requestName = "usernameAlreadyExists"
        const {mocked} = interceptRequest({
            requestName,
            method: "POST",
            url: urlMap.serverAuth.register,
            statusCode: StatusCodes.CONFLICT,
            body: {msg: 'bad', 'cause':'you provided an invalid username or password' }
        })

        // visit the register page, fill in the registration form, and click the submit button
        registerPage.visitRegisterPage()
        registerPage.fillRegistrationForm(userDts)
        registerPage.getSubmitButton().click()

        // if we are using the MOCK_DATABASE, wait for the request to complete
        if (mocked) cy.wait(`@${requestName}`);

        // assert to be sure that the correct error is displayed
        cy.contains(StatusCodes.CONFLICT).should("exist")
    })

    it("should show an error message if there is an issue from the server", () => {
        // Intercept the login request and provide a custom response
        const requestName = "failedRegisterRequest"
        const {mocked} = interceptRequest({
            requestName,
            force_mock: true,
            method: "POST",
            url: urlMap.serverAuth.register,
            statusCode: StatusCodes.BAD_REQUEST,
            body: {msg: 'bad', 'cause':'you provided an invalid username or password' }
        })

        // visit the register page, fill in the registration form, and click the submit button
        registerPage.visitRegisterPage()
        registerPage.fillRegistrationForm(userDts)
        registerPage.getSubmitButton().click()

        // if we are using the MOCK_DATABASE, wait for the request to complete
        if (mocked) cy.wait(`@${requestName}`);

        // assert that the registration was not successful
        cy.contains(StatusCodes.BAD_REQUEST).should("exist")
    })
})