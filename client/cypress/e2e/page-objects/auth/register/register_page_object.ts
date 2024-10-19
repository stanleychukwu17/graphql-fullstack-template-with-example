import { urlMap } from "../../../../../app/utils/url-mappings/"

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

    async interceptUserRegistrationRequest () {
        const cypress_test_with = Cypress.env('CYPRESS_TEST_WITH');
        const requestName = "registerRequest"

        if (cypress_test_with === "REAL_DATABASE") {
            // do nothing
        } else if (cypress_test_with === "MOCK_DATABASE") {
            // Intercept the login request and provide a custom response
            cy.intercept('POST', urlMap.serverAuth.login, {
                statusCode: 200,
                body:{
                    msg: 'okay',
                    accessToken: 'mockedToken',
                    refreshToken: 'mockedRefreshToken',
                    session_fid: '134535',
                    name: 'Big stanley'
                },
            }).as(requestName);
        }

        return {requestName}
    }

    async completeUserRegistration() {
        this.visitRegisterPage()
        this.fillRegistrationForm({
            name: "test",
            username: "test",
            email: "test",
            password: "test",
            gender: "male",
        })
        cy.get("button[type='submit']").click()
    }
}