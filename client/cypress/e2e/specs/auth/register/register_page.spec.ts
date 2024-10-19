import LoginPageObject from "../../../page-objects/auth/login/login_page_object"
import RegisterPageObject from "../../../page-objects/auth/register/register_page_object"

const registerPage = new RegisterPageObject()
const loginPageObject = new LoginPageObject()

describe('Register page', () => {
    it("should register with valid credentials", () => {
        registerPage.visitRegisterPage()
    })
})