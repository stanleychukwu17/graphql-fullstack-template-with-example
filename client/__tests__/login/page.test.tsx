import '@testing-library/jest-dom'
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { act } from 'react-dom/test-utils';


import axios from 'axios';
import { BACKEND_PORT as backEndPort } from '@/my.config';
import LoginPage from '@/app/login/page'


// mocking of redux
const useAppDispatchMock = jest.fn()
jest.mock('../../app/redux/hook', () => ({
    useAppDispatch: () => useAppDispatchMock,
}))

// mocking of next/navigation
const routePushFunction = jest.fn((url: string) => {
    window.location.pathname = url
})
jest.mock('next/navigation', () => ({
    useRouter: () => {
        return {
            push: routePushFunction
        }
    }
}))

// mocking of axios
jest.mock('axios')

// mocking of react-hook-form
const setValueMock = jest.fn()
const { useForm } = jest.requireActual('react-hook-form');
jest.mock('react-hook-form', () => ({
    useForm: () => ({
        ...useForm(), // i'm preserving all the methods returned from the hook, i only want to modify setValue
        setValue: setValueMock,
    }),
}))


describe("Testing login component", () => {
    // define some global variables
    const userEmail = 'eazi@gmail.com'
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
            await act(async () => {
                fireEvent.click(button)
            });
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

    it('should refuse to login if empty or short details are provided', async () => {
        const {container, button} = await renderLoginPage({fillForm:'no'})

        // submit the form
        fireEvent.click(button)

        // get the error messages and confirm that they are visible
        const errMsg = await screen.findAllByText(/This field is required/i)

        // assertion
        expect(errMsg.length).toBeGreaterThanOrEqual(1) // at-least 1 error message should be visible
        expect(errMsg[0]).toBeInTheDocument()
    })

    // test-2
    it('should login a user if correct details are provided', async () => {
        // Mock the response from the server
        (axios.post as any).mockResolvedValueOnce({ data: { msg: 'okay' } });
        // (axios.post as any).mockImplementation({ data: responseData });

        const { emailInput, passwordInput, button } = await renderLoginPage({fillForm:'yes'})

        // Wait for the login request to complete
        await waitFor(() => {
            // assert that all the axios calls and arguments are as we expect
            expect(axios.post).toHaveBeenCalledTimes(1);
            expect((axios.post as any).mock.calls[0][0]).toBe(`${backEndPort}/users/login`);
            expect((axios.post as any).mock.calls[0][1]).toEqual({username: userEmail, password: userPassword});
            // console.log(JSON.stringify((axios.post as any).mock.calls[0]))

            // expect the redux dispatch function to have been called
            expect(useAppDispatchMock).toHaveBeenCalledTimes(1)

            // Assert that the user has been redirected back to the home page
            expect(routePushFunction).toHaveBeenCalled(); // i.e the next.js useRoute() function
            expect(window.location.pathname).toBe('/'); // the user has been redirected back to the home page
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


describe("Testing Register page", () => {
    const newUser: Record<string, string> = {
        name:'stanley',
        username:'stanleyBoyIsBack',
        email:'stanleyBoy@bigman.com',
        gender:'male',
        password:'iLoveJESUS',
        password2:'iLoveJESUS'
    }

    // renders the logIn page
    const renderRegisterPage = async ({fillForm} : {fillForm:'yes'|'no'}) => {
        const container = render(<LoginPage />)

        const name = container.getByLabelText('name') as HTMLInputElement
        const username = container.getByLabelText('username') as HTMLInputElement
        const email = container.getByLabelText('email') as HTMLInputElement
        const gender = container.getByLabelText('gender') as HTMLInputElement
        const password = container.getByLabelText('password') as HTMLInputElement
        const password2 = container.getByLabelText('Re-enter Password') as HTMLInputElement
        const button = container.getByRole('button', {name: /Register/i}) as HTMLButtonElement

        if (fillForm === 'yes') {
            fireEvent.change(name, {target: {value:newUser.name}})
            fireEvent.change(username, {target: {value:newUser.username}})
            fireEvent.change(email, {target: {value:newUser.email}})
            fireEvent.change(gender, {target: {value:newUser.gender}})
            fireEvent.change(password, {target: {value:newUser.password}})
            fireEvent.change(password2, {target: {value:newUser.password2}})
            
            await act(async () => {
                fireEvent.click(button)
            });
        }

        return { container, name, username, email, gender, password, password2, button }
    }

    // clear all mocks after each test
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('reject the submission if there any empty input fields & also makes sure that the component is rendered properly', async () => {
        const {container: {findAllByText}, button} = await renderRegisterPage({fillForm:'no'})

        fireEvent.click(button)
        const errorMessage = await findAllByText('This field is required!!!')

        expect(button).toBeInTheDocument() // this one ensures that the component is rendered properly
        expect(errorMessage.length).toBeGreaterThanOrEqual(1)
    })

    it('successfully registers a new user', async () => {
        // mock the axios request to return successful message from the backEnd
        (axios.post as any).mockResolvedValueOnce({data: {msg:'okay'}})

        // render the registration page, fill the form and submit the form
        const {container, button} = await renderRegisterPage({fillForm:'yes'})

        // Wait for the login request to complete
        await waitFor( async () => {
            expect(axios.post).toHaveBeenCalled()
            expect(setValueMock).toHaveBeenCalled()
        })
    })

    it('handle all errors from axios (i.e when making the axios request)', async () => {
        const cause = 'Custom error from testing';
        // Mocking the Axios post method to reject with an error object
        (axios.post as jest.Mock).mockRejectedValueOnce({ message: cause, data: { msg: 'error', cause } });
    
        // render the registration page, fill the form and submit the form
        const {container, button} = await renderRegisterPage({fillForm:'yes'})

        const msgBox = await screen.findByTestId('message-box')
        const errMsg = within(msgBox).getByText(new RegExp(cause))

        expect(axios.post).toHaveBeenCalled()
        expect(msgBox).toBeInTheDocument()
        expect(errMsg).toBeInTheDocument()
    })
/**
run
clear && pnpm test
clear && pnpm test:watch
*/
})