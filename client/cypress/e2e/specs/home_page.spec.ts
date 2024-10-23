import { urlMap } from "../../../app/utils/url-mappings/"
import HomePageObject from "../page-objects/home_page_object"
import RegisterPageObject, { userRegistrationDetails } from "../page-objects/auth/register/register_page_object"
import LoginPageObject from "../page-objects/auth/login/login_page_object"

const homePage = new HomePageObject()
const registerPage = new RegisterPageObject()
const loginPage = new LoginPageObject()

describe('Home Page', () => {
    let userDts: userRegistrationDetails;

    before(() => {
        userDts = registerPage.generateRegistrationFormFields()
    })

    it("should display the home page and make sure important links from the homePage works", () => {
        homePage.visitHomePage()

        // first assertions
        cy.url().should('include', urlMap.home)
        homePage.getLoginLink().should('be.visible')
        homePage.getRegisterLink().should('be.visible')
        homePage.getLogoutLink().should('not.exist')

        // verify that the login link works
        homePage.getLoginLink().click().then(() => {
            cy.url().should('include', urlMap.clientAuth.login)
            cy.go("back")
        })

        // verify that the register link works
        homePage.getRegisterLink().click().then(() => {
            cy.url().should('include', urlMap.clientAuth.register)
            cy.go("back")
        })
    })

    it("should make sure registration, login and logout links are working", () => {
        const {loginLink} = registerPage.completeUserRegistration(userDts)

        // navigates to the login page and assert that we are on the login page
        loginLink.click()
        cy.url({timeout: 10000}).should("include", urlMap.clientAuth.login)

        // log the user in
        loginPage.completeUserLogin(userDts.username, userDts.password)

        // assert that the logout link is visible
        // then logout and assert that we are on the home page
        homePage.getLogoutLink().should('be.visible')
        homePage.getLogoutLink().click()
        cy.url({timeout: 10000}).should("include", urlMap.home)
    })

    it("should select a theme and make sure it works", () => {
        homePage.visitHomePage()
        cy.get("div.changeThemeCover").click()
        cy.get("[data-testid='theme-dark']").click()

        cy.get("html").should("have.attr", "data-theme", "dark");
        loginPage.visitLoginPage()
    })
})