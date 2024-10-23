/// <reference types="cypress" />

import { StatusCodes } from "http-status-codes"
import { urlMap } from "../../../../../app/utils/url-mappings/"
import { interceptRequest } from "../../utils"
import RegisterPageObject, { userRegistrationDetails } from "../register/register_page_object"

const registerPage = new RegisterPageObject()

export default class LoginPageObject {

    visitLoginPage() {
        cy.visit(urlMap.clientAuth.login)
    }

    getUsernameInput() {
        return cy.get("input[data-testid='login_username']")
    }

    getPasswordInput() {
        return cy.get("input[data-testid='login_password']")
    }

    getLoginButton() {
        return cy.get("div.btnCvr button")
    }

    login(username: string, password: string) {
        this.getUsernameInput().type(username)
        this.getPasswordInput().type(password)
        this.getLoginButton().click()
    }
    // ---
    // ---
    // ---

    logoutTheLoggedInUser() {
        // intercept the logout request
        const requestName = 'logoutRequest';
        const {mocked} = interceptRequest({
            requestName,
            method: "POST",
            url: urlMap.serverAuth.logout,
            statusCode: StatusCodes.OK,
            body: {msg: 'okay', cause: 'logout successful from mocked database'},
        })

        // visit the logout page
        cy.visit(urlMap.clientAuth.logout)

        // if we are using the MOCK_DATABASE, wait for the request to complete
        if (mocked) cy.wait(`@${requestName}`);

        // verify that the logout was successful
        cy.url().should('not.include', urlMap.clientAuth.logout)
    }

    fillAndSubmitLoginInfo(username: string, password: string) {
        this.getUsernameInput().type(username)
        this.getPasswordInput().type(password)
        this.getLoginButton().click()
    }

    completeUserLogin(username: string, password: string) {
        this.visitLoginPage()

        const requestName = 'userLoginRequest';
        const {mocked} = interceptRequest({
            requestName,
            method: "POST",
            url: urlMap.serverAuth.login,
            statusCode: StatusCodes.OK,
            body: {msg: 'okay', accessToken: 'mockedToken', refreshToken: 'mockedRefreshToken', session_fid:"134535", name: "Big stanley" },
        })

        // fill's and submits the login info
        this.fillAndSubmitLoginInfo(username, password)

        // if we are using the MOCK_DATABASE, wait for the request to complete
        if (mocked) cy.wait(`@${requestName}`);

        // verify that the login was successful
        cy.url().should('not.include', urlMap.clientAuth.login)
    }


    completeRegisterAndLoginUser(userDts: userRegistrationDetails) {
        // register the user
        const {loginLink} = registerPage.completeUserRegistration(userDts)
        loginLink.click().then(() => {
            // assert that we are on the login page
            cy.url({timeout: 10000}).should("include", urlMap.clientAuth.login)
        })

        // log the user in using the user's username
        this.completeUserLogin(userDts.username, userDts.password)
    }
}