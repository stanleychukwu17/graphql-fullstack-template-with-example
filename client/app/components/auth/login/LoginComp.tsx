"use client"
import React, {useEffect, useState} from "react";
import axios from 'axios';
import {useForm, SubmitHandler} from "react-hook-form"
import { useRouter } from 'next/navigation';
import { motion, useAnimationControls } from "framer-motion";

import { useAppDispatch, useAppSelector } from "@/app/utils/redux/hook";
import { updateUser } from '@/app/utils/redux/features/userSlice';
import { setPageTransition } from '@/app/utils/redux/features/siteSlice';
import MessageComp, {MessageCompProps} from "@/app/components/Message/MessageComp";
import { urlMap } from "@/app/utils/url-mappings";

// url for server login request
const backEndPort = process.env.NEXT_PUBLIC_BACKEND_PORT;
const loginUrl = `${backEndPort}${urlMap.serverAuth.login}`

// type - for React Hook Form
type LoginForRHF = {
    username: string
    password: string
}



export default function LoginComponent() {
    const { loggedIn } = useAppSelector(state => state.user)
    const urlBeforeLogin = useAppSelector(state => state.site.urlBeforeLogin)
    const dispatch = useAppDispatch()
    const router = useRouter()
    const [isLoading1, setIsLoading1] = useState<boolean>(false) // used for login
    const [showAlert, setShowAlert] = useState<boolean>(false) // for showing of error messages from the backend
    const [alertMsg, setAlertMsg] = useState<MessageCompProps>({msg_type:'', msg_dts:[{text:''}]}) // the error message
    const animationControl = useAnimationControls()

    // page transition completed, so update 'setPageTransition' to false
    useEffect(() => {
        dispatch(setPageTransition(false))
    }, [dispatch])

    // we don't want a logged in user to be able to view this page
    useEffect(() => {
        if (loggedIn === 'yes') {
            router.push(urlBeforeLogin)
            animationControl.set({opacity: 0})
        } else {
            animationControl.start({opacity: 1})
        }
    }, [loggedIn, router, animationControl, urlBeforeLogin])

    const { register: registerLogin, handleSubmit: handleLoginSubmit, setValue: loginSetValue, formState: {errors:loginError} } = useForm<LoginForRHF>()

    const submitLogin: SubmitHandler<LoginForRHF> = async (data) => {
        setIsLoading1(true)

        await axios.post(loginUrl, data, {headers: {'Content-Type': 'application/json'}})
        .then((res) => {
            if(res.data.msg === 'okay') {
                localStorage.setItem('userDts', JSON.stringify(res.data));
                dispatch(updateUser({loggedIn: 'yes', ...res.data}))

                // waits a little bit so that redux can finish it's thing and they i can redirect to the home page
                setTimeout(() => {
                    router.push(urlBeforeLogin)
                }, 500)

                // clears all of the input field for login
                Object.keys(data).forEach((item) => {
                    loginSetValue(item as "username" | "password", "") // RHF hook used here
                })
            } else {
                setShowAlert(true)
                setAlertMsg({'msg_type':res.data.msg, 'msg_dts':[{text:res.data.cause}]})
            }

            setIsLoading1(false)
        })
        .catch((err) => {
            const msg_dts = `Status: ${err.response?.status}, ${err.response?.data.cause}` 
            // console.log(err.message, err.response)
            setShowAlert(true)
            setAlertMsg({'msg_type':'bad', 'msg_dts':[{text:msg_dts}]})
            setIsLoading1(false)
        });
    }

    return (
        <motion.div initial={{opacity: 0}} animate={animationControl}>
            {showAlert && (
                <MessageComp {...alertMsg} closeAlert={setShowAlert} />
            )}

            <div className="pb-10 text-4xl">Hi there!</div>

            <div className="ovrCover flex">
                {/*--START-- the login section */}
                <div className="w-1/2">
                    <div className="titleUp">Login</div>
                    <form onSubmit={handleLoginSubmit(submitLogin)}>
                        <div className="inputCover">
                            <div className="inpTitle font-bold">
                                <label htmlFor="login_input">Username or Email</label>
                            </div>
                            <div className="inpInput">
                                <input data-testid='login_username' id='login_input' type="text" {...registerLogin("username", { required: true })} />
                                {loginError.username && <p>This field is required!!!</p>}
                            </div>
                        </div>
                        <div className="inputCover">
                            <div className="inpTitle">
                                <label htmlFor="login_password">Password</label>
                            </div>
                            <div className="inpInput">
                                <input data-testid='login_password' type="password" {...registerLogin("password", { required: true })} />
                                {loginError.password && <p>This field is required!!!</p>}
                            </div>
                        </div>
                        <div className="btnCvr">
                            {!isLoading1 && <button type="submit">Login</button>}
                            {isLoading1 && <p>Loading...</p>}
                        </div>
                    </form>
                </div>
                {/* --END-- */}
            </div>
        </motion.div>
    )
}