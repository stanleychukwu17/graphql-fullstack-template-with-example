import { urlMap } from "@/app/utils/url-mappings/"
import LoginPageObject from "../../../page-objects/auth/login/login_page_object"

const loginPageObject = new LoginPageObject()

describe('Login page', () => {
    it("should login with valid credentials", () => {
        // Intercept the login request and provide a custom response
        cy.intercept('POST', urlMap.serverAuth.login, {
            statusCode: 200,
            body:{msg: 'okay', accessToken: 'mockedToken', refreshToken: 'mockedRefreshToken', session_fid:"134535", name: "Big stanlo" },
        }).as('loginRequest'); // Adjust the URL as needed

        loginPageObject.visitLoginPage()
        loginPageObject.login('stanley', 'p2456d')

        // Wait for the login request to finish
        cy.wait('@loginRequest');
    })
})