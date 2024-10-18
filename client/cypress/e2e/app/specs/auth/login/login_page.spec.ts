import { urlMap } from "@/app/utils/url-mappings/"
import LoginPageObject from "../../../page-objects/auth/login/login_page_object"

const loginPageObject = new LoginPageObject()

describe('Login page', () => {
    it("should display the login page with all its elements", () => {
        loginPageObject.visitLoginPage()

        // check for the input elements and the button
        loginPageObject.getUsernameInput().should('be.visible')
        loginPageObject.getPasswordInput().should('be.visible')
        loginPageObject.getLoginButton().should('be.visible')

        // name?:string;
        // session_fid?:number;
        // loggedIn?:'yes'|'no';
        // refreshToken?: string;
        // accessToken?: string;
        // must_logged_in_to_view_this_page?: 'yes'|'no';
    })

    it("should login with valid credentials", () => {
        // Intercept the login request and provide a custom response
        cy.intercept('POST', urlMap.serverAuth.login, {
            statusCode: 200,
            body: { token: 'mockedToken', user: { username: 'testuser' } },
        }).as('loginRequest'); // Adjust the URL as needed

        loginPageObject.visitLoginPage()
        loginPageObject.login('stanley', 'password')
    })
})