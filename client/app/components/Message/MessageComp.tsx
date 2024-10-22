'use client'
import {BsCheckCircle, BsExclamationCircle} from 'react-icons/bs'
import {AiOutlineClose} from 'react-icons/ai'
import { useCallback, useEffect } from 'react';

export type MessageCompProps = {
    msg_type: 'okay'|'bad'|'';
    msg_dts: {text:string}[];
    closeAlert?: React.Dispatch<React.SetStateAction<boolean>>;
    haveBtn?: boolean;
    btnList?: {btnTitle: string, btnAction: () => void}[]
}

export default function MessageComp({msg_type, msg_dts, closeAlert, ...props}: MessageCompProps) {

    const timeToCloseThisAlert = useCallback(() => {
        if (closeAlert) {
            closeAlert(false)
        }
    }, [closeAlert])

    const check_if_we_should_close_alert = useCallback((event: KeyboardEvent) => {
        if (event.key === 'Escape') {
            timeToCloseThisAlert()
        }
    }, [timeToCloseThisAlert])

    useEffect(() => {
        window.addEventListener("keyup", check_if_we_should_close_alert)

        return () => {
            window.removeEventListener("keyup", check_if_we_should_close_alert)
        }
    }, [check_if_we_should_close_alert])


    return (
        <div data-testid="message-box" className="fixed z-10 top-0 right-0 bottom-0 left-0 bg-[rgba(0,0,0,0.8)] shadow-2xl">
            <div
                role="button"
                aria-label='close alert window'
                data-testid="closeAlertMsg"
                className='absolute top-0 right-5 bottom-auto left-auto bg-white text-4xl p-3 cursor-pointer hover:bg-[#f1f2f6] active:top-1'
                onClick={timeToCloseThisAlert}
            >
                <AiOutlineClose />
            </div>
            <div className="w-1/2 m-auto mt-20 bg-[#fffefb] rounded flex">
                <div className="w-[150px] text-8xl p-5">
                    {msg_type === 'okay' && <p className="text-[#00b894]"><BsCheckCircle /></p>}
                    {msg_type === 'bad' && <p className="text-[#df0e3a]"><BsExclamationCircle /></p>}
                </div>
                <div className="pt-5">
                    <div className="text-2xl font-semibold">
                        {msg_type === 'okay' && <p className="text-[#00b894]">Success</p>}
                        {msg_type === 'bad' && <p className="text-[#df0e3a]">Error</p>}
                    </div>
                    <div className="text-base pt-2 pb-10 pr-7 leading-normal tracking-wide first-letter:capitalize text-black">
                        {
                            msg_dts.map(items => <p key={items.text}>{items.text}</p>)
                        }
                    </div>
                    {props.haveBtn && (
                        props.btnList?.map(({btnTitle, btnAction}, index) => (
                            <div className="flex space-x-6 pb-5" key={`btn-${btnTitle}-${index}`}>
                                <button data-testid="btn-msg-comp" className="generalBtn" onClick={btnAction}>{btnTitle}</button>
                            </div>                            
                        ))
                    )}
                </div>
            </div>
        </div>
    )
}