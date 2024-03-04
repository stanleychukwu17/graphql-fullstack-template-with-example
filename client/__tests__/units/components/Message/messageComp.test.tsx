import '@testing-library/jest-dom'
import { RenderResult, fireEvent, render, screen, waitFor } from '@testing-library/react'

import { MessageCompProps } from '@/app/components/Message/MessageComp'
import MessageComp from '@/app/components/Message/MessageComp'


describe("Message Component test suite", () => {
    // mock function for closing of alert box
    const closeAlertMock = jest.fn()
    const msg_dts = 'message in details'
    let container: RenderResult

    const renderComponent = async ({msg_dts, msg_type, closeAlert}: MessageCompProps) => {
        return render(<MessageComp msg_type={msg_type} msg_dts={msg_dts} closeAlert={closeAlert} />)
    }

    // set-up before each test
    beforeEach(async() => {
        // const {findByText} = await renderComponent()
        container = await renderComponent({
            msg_type: 'okay',
            msg_dts: msg_dts,
            closeAlert: closeAlertMock
        })
    })

    // tear-down after each test
    afterEach(() => {
        jest.clearAllMocks()
    })

    // pass in the msg_type, msg_dts, 
    it('shows message with the message details received', async () => {
        const {findByText} = container

        const actual = await findByText(new RegExp(msg_dts))
        expect(actual).toBeInTheDocument()
    })

    it('closes the alert when the close function is called', async () => {
        const {findByTestId} = container

        const closeButton = await findByTestId('closeAlertMsg')
        fireEvent.click(closeButton)

        expect(closeButton).toBeInTheDocument()
        expect(closeAlertMock).toHaveBeenCalled()
        expect(closeAlertMock).toHaveBeenCalledTimes(1)
    })

    it('see if you can test the keyup-for escape to see that it is working', async () => {
        const {findByTestId} = container

        const closeButton = await findByTestId('closeAlertMsg')
        fireEvent.keyUp(document, { key: 'Escape' });

        expect(closeButton).toBeInTheDocument()
        expect(closeAlertMock).toHaveBeenCalled()
        expect(closeAlertMock).toHaveBeenCalledTimes(1)
    })
})