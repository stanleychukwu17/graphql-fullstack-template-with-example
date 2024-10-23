import { urlMap } from "../../../app/utils/url-mappings/"

export default class HomePageObject {
    visitHomePage() {
        cy.visit(urlMap.home)
    }

    getLoginLink() {
        return cy.get("[data-testid='login']")
    }

    getRegisterLink() {
        return cy.get("[data-testid='register']")
    }

    getLogoutLink() {
        return cy.get("[data-testid='logout']")
    }

}