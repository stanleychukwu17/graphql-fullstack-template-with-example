import '@testing-library/jest-dom'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { act } from 'react-dom/test-utils';


import axios from 'axios';
import { BACKEND_PORT as backEndPort } from '@/my.config';
import LoginPage from '@/app/login/page'


// mocking of redux
const useAppDispatchMock = jest.fn()
jest.mock('../../app/redux/hook', () => ({
    useAppDispatch: () => useAppDispatchMock,
}))

const routePushFunction = jest.fn((url: string) => {
    window.location.pathname = url
})
// mocking of next/navigation
jest.mock('next/navigation', () => ({
    useRouter: () => {
        return {
            push: routePushFunction
        }
    }
}))

// mocking of axios
jest.mock('axios')


describe("Testing login component", () => {
    // define some global variables
    const userEmail = 'eazi@gmal.com'
    const userPassword = '12345'

    // renders the logIn page
    const renderLoginPage = async ({fillForm} : {fillForm:'yes'|'no'}) => {
        const container = render(<LoginPage />)

        const emailInput = container.getByLabelText('Username or Email') as HTMLInputElement
        const passwordInput = container.getByTestId('login password') as HTMLInputElement
        const button = container.getByRole('button', {name: /login/i}) as HTMLButtonElement

        if (fillForm === 'yes') {
            fireEvent.change(emailInput, {target: {value:userEmail}})
            fireEvent.change(passwordInput, {target: {value:userPassword}})
            await act(async () => { fireEvent.click(button) });
        }

        return {container, emailInput, passwordInput, button}
    }

    // clear all mocks after each test
    afterEach(() => {
        jest.clearAllMocks();
    });

    // test-1
    it("should render the page correctly", async () => {
        const { emailInput, passwordInput, button } = await renderLoginPage({fillForm:'no'})

        expect(emailInput).toBeInTheDocument()
        expect(passwordInput).toBeInTheDocument()
        expect(button).toBeInTheDocument()
    })

    it.todo('should refuse to login if empty or short details are provided')

    // test-2
    it('should login a user if correct details are provided', async () => {
        // Mock the response from the server
        const responseData = { msg: 'okay' };
        (axios.post as any).mockResolvedValueOnce({ data: responseData });
        // (axios.post as any).mockImplementation({ data: responseData });

        const { emailInput, passwordInput, button } = await renderLoginPage({fillForm:'yes'})

        // Wait for the login request to complete
        await waitFor(() => {
            // assert that all the axios calls and arguments are as we expect
            expect(axios.post).toHaveBeenCalledTimes(1);
            expect((axios.post as any).mock.calls[0][0]).toBe(`${backEndPort}/users/login`);
            expect((axios.post as any).mock.calls[0][1]).toEqual({username: userEmail, password: userPassword});
            // console.log(JSON.stringify((axios.post as any).mock.calls[0]))

            // expect the axios function to be called
            expect(useAppDispatchMock).toHaveBeenCalledTimes(1)

            // Assert that the user has been redirected back to the home page
            expect(routePushFunction).toHaveBeenCalled()
            expect(window.location.pathname).toBe('/');
        });
    })

    // test-3
    it('should show an error message if there is an issue from the server', async () => {
        // Mock the response from the server
        const responseData = { msg: 'bad', 'cause':'you provided an invalid username or password' };
        (axios.post as any).mockResolvedValueOnce({ data: responseData });

        const { emailInput, passwordInput, button } = await renderLoginPage({fillForm:'yes'})

        // Wait for the login request to complete
        await waitFor( async () => {
            const errorMsg = await screen.findByText(/you provided an invalid username or password/i)
            expect(errorMsg).toBeInTheDocument()
        });
    })

    // test-4
    it('handle errors when form is submitted, i.e if there are any errors', async () => {
        (axios.post as any).mockRejectedValueOnce(new Error('Server error'));

        const { emailInput, passwordInput, button } = await renderLoginPage({fillForm:'yes'})

        // Wait and check to see if there were any errors
        await waitFor( async () => {
            const errorMsg = await screen.findByText(/please contact the customer support and report this issue/i)
            expect(errorMsg).toBeInTheDocument()
        });
    })
})


describe("Testing Register component", () => {

    // it("should display correct input fields and button")
})