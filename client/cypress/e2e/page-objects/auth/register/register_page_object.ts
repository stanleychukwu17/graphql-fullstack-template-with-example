import { urlMap } from "../../../../../app/utils/url-mappings/"
import { generateRandomString } from "../../utils"

type RegisterUserProps = {
    name: string;
    username: string;
    email: string;
    password: string;
    gender: string;
}


export default class RegisterPageObject {
    visitRegisterPage() {
        cy.visit(urlMap.clientAuth.register)
    }

    async fillRegistrationForm(userDts: RegisterUserProps) {
        // get all the input element and type
        cy.get("input#name").type(userDts.name)
        cy.get("input#username").type(userDts.username)
        cy.get("input#email").type(userDts.email)
        cy.get("select#gender").select(userDts.gender)
        cy.get("input#password").type(userDts.password)
        cy.get("input#re-enter-password").type(userDts.password)
    }

    async interceptRegistrationRequest () {
        const cypress_test_with = Cypress.env('CYPRESS_TEST_WITH');
        const requestName = "registerRequest"
        let mocked = false

        if (cypress_test_with === "REAL_DATABASE") {
            // do nothing
        } else if (cypress_test_with === "MOCK_DATABASE") {
            // Intercept the registration request and provide a custom response
            mocked = true
            cy.intercept('POST', urlMap.serverAuth.register, {
                statusCode: 200,
                body: {msg: 'okay', cause: 'registration successful from mocked database'},
            }).as(requestName);
        }

        return {requestName, mocked}
    }

    async completeUserRegistration() {
        const name = `test-${generateRandomString(5)}`
        const username = `test-${generateRandomString(5)}`
        const email = `test-${generateRandomString(5)}@testing.com`
        const password = `stanley`
        const gender = "male"
        const fields = {name, username, email, password, gender}

        // intercepts the request, incase we are using the MOCK_DATABASE
        const {requestName, mocked} = await this.interceptRegistrationRequest()

        this.visitRegisterPage()
        this.fillRegistrationForm(fields)

        cy.get("div.btnCvr button[type='submit']").click()

        // if we are using the MOCK_DATABASE, wait for the request to complete
        if (mocked) cy.wait(`@${requestName}`);

        // assert that the login was successful
        const loginBtn = cy.get("button[data-testid='btn-msg-comp']")
        loginBtn.should('be.visible');
        loginBtn.click().then(() => {
            // assert that we are on the login page
            cy.url().should("include", urlMap.clientAuth.login, {timeout: 15000})
            console.log(cy.url())
        })

        return fields
    }
}