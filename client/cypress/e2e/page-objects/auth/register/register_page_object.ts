import { StatusCodes } from "http-status-codes"
import { urlMap } from "../../../../../app/utils/url-mappings/"
import { generateRandomString, interceptRequest } from "../../utils"

export type userRegistrationDetails = {
    name:string;
    username:string;
    email:string;
    password:string;
    gender:string;
}

type completeRegistrationType = {
    userDts: userRegistrationDetails
    loginLink: Cypress.Chainable<JQuery<HTMLElement>>
}

export default class RegisterPageObject {
    visitRegisterPage() {
        cy.visit(urlMap.clientAuth.register)
    }

    getSubmitButton() {
        return cy.get("div.btnCvr button[type='submit']")
    }

    generateRegistrationFormFields() : userRegistrationDetails {
        const name = `test-${generateRandomString(5)}`
        const username = `test-${generateRandomString(5)}`
        const email = `test-${generateRandomString(5)}@testing.com`
        const password = `stanley`
        const gender = "male"

        return {name, username, email, password, gender}
    }

    fillRegistrationForm(dts: userRegistrationDetails) : userRegistrationDetails {
        cy.get("input#name").type(dts.name)
        cy.get("input#username").type(dts.username)
        cy.get("input#email").type(dts.email)
        cy.get("select#gender").select(dts.gender)
        cy.get("input#password").type(dts.password)
        cy.get("input#re-enter-password").type(dts.password)

        return dts
    }

    completeUserRegistration(userDts: userRegistrationDetails) : completeRegistrationType {
        const requestName = "register"

        // intercepts the request, incase we are using the MOCK_DATABASE
        const {mocked} = interceptRequest({
            requestName: "register",
            method: "POST",
            url: urlMap.serverAuth.register,
            statusCode: StatusCodes.OK,
            body: {msg: 'okay', cause: 'registration successful from mocked database'},
        })

        this.visitRegisterPage()
        this.fillRegistrationForm(userDts)
        this.getSubmitButton().click()

        // if we are using the MOCK_DATABASE, wait for the request to complete
        if (mocked) cy.wait(`@${requestName}`);

        // assert that the login was successful
        const loginLink = cy.get("button[data-testid='btn-msg-comp']")
        loginLink.should('be.visible');

        return {userDts, loginLink}
    }
}