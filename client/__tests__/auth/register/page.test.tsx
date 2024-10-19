import '@testing-library/jest-dom'
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'

import RegComponent from '@/app/components/auth/register/RegComp';

const backEndPort = process.env.BACKEND_PORT;

// mocking of redux
const useAppDispatchMock = jest.fn()
const useAppSelectorMock = jest.fn()
jest.mock('../../../app/utils/redux/hook', () => ({
    useAppDispatch: () => useAppDispatchMock,
    useAppSelector: () => useAppSelectorMock
}))

// mocking of next/navigation
const routePushFunction = jest.fn((url: string) => {
    window.location.pathname = url
})
jest.mock('next/navigation', () => ({
    useRouter: () => ({
        push: routePushFunction
    })
}))

// mocking of axios
import axios from 'axios'; // importing axios because we want to mock the axios request
jest.mock('axios')

// mocking of react-hook-form
const setValueMock = jest.fn()
const { useForm } = jest.requireActual('react-hook-form'); // when you use jest.requireActual, you're telling jest to preserve all the methods that come from his package, i.e do not modify or mock any methods returned from the package/module, i.e leave everything as it is
jest.mock('react-hook-form', () => ({
    useForm: () => ({
        ...useForm(), // i'm preserving all the methods returned from the 'useForm' hook, i only want to modify setValue
        setValue: setValueMock,
    }),
}))


describe("Testing Register page", () => {
    const newUser: Record<string, string> = {
        name:'stanley',
        username:'stanleyBoyIsBack',
        email:'stanleyBoy@bigman.com',
        gender:'male',
        password:'iLoveJESUS',
        password2:'iLoveJESUS'
    }

    // clear all mocks after each test
    afterEach(() => {
        jest.clearAllMocks();
    });

    // renders the logIn page
    const renderRegisterPage = async ({fillForm} : {fillForm:'yes'|'no'}) => {
        const container = render(<RegComponent />)

        const name = container.getByLabelText('name') as HTMLInputElement
        const username = container.getByLabelText('username') as HTMLInputElement
        const email = container.getByLabelText('email') as HTMLInputElement
        const gender = container.getByLabelText('gender') as HTMLSelectElement
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

            waitFor( async () => {
                fireEvent.click(button)
            })
        }

        return { container, name, username, email, gender, password, password2, button }
    }

    it('reject the submission if there any empty input fields & also makes sure that the component is rendered properly', async () => {
        const {container: {findAllByText}, button} = await renderRegisterPage({fillForm:'no'})

        fireEvent.click(button)
        const errorMessage = await findAllByText('This field is required!!!')

        expect(button).toBeInTheDocument() // this one ensures that the component is rendered properly
        expect(errorMessage.length).toBeGreaterThanOrEqual(1)
    })

    it('successfully registers a new user', async () => {
        // mock the axios request to return successful message from the backEnd
        (axios.post as jest.Mock).mockResolvedValueOnce({data: {msg:'okay'}})

        // render the registration page, fill the form and submit the form
        const {container, button} = await renderRegisterPage({fillForm:'yes'})

        // Wait for the login request to complete
        await waitFor( async () => {
            expect(axios.post).toHaveBeenCalled()
            expect(setValueMock).toHaveBeenCalled()
        })
    })

    it('handle all errors from axios (i.e when making the axios request)', async () => {
        // Mocking the Axios post method to reject with an error object
        const cause = "server error"
        const axiosError = {status: 400, response: { data: {cause} }};
        (axios.post as jest.Mock).mockRejectedValueOnce(axiosError);

        // render the registration page, fill the form and submit the form
        const {button} = await renderRegisterPage({fillForm:'yes'})

        const msgBox = await screen.findByTestId('message-box')
        const errMsg = within(msgBox).getByText(new RegExp(cause, 'i'))

        expect(axios.post).toHaveBeenCalled()
        expect(msgBox).toBeInTheDocument()
        expect(errMsg).toBeInTheDocument()
    })
})