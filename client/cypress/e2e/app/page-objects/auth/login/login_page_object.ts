//Inside your google-search.page.ts file. This is pageobject file.
/// <reference types="cypress" />

import { urlMappings } from "@/app/utils/url-mappings/"

export default class LoginPageObject {

    visitLoginPage() {
        cy.visit(urlMappings.clientAuth.login)
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
}