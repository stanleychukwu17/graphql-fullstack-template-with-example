"use client"
import axios from 'axios';
import { useRouter } from 'next/navigation';
import React, {useEffect, useState} from "react";
import {useForm, SubmitHandler} from "react-hook-form"
import { motion, useAnimationControls } from "framer-motion";

import { useAppDispatch, useAppSelector } from "@/app/utils/redux/hook";
import { setPageTransition } from '@/app/utils/redux/features/siteSlice';
import { BACKEND_PORT as backEndPort } from '@/my.config';
import { urlMap } from "@/app/utils/url-mappings";
import MessageComp, {MessageCompProps} from "@/app/components/Message/MessageComp";

// url for server login request
const regUrl = `${backEndPort}${urlMap.serverAuth.register}`

type RegisterRHF = {
    name: string
    username: string
    email: string
    gender: 'male'|'female'
    password: string
    confirm_password: string
}

export default function RegComponent() {
    const { loggedIn } = useAppSelector(state => state.user)
    const dispatch = useAppDispatch()
    const router = useRouter()
    const [isLoading2, setIsLoading2] = useState<boolean>(false) // used for registering
    const [showAlert, setShowAlert] = useState<boolean>(false) // for showing of error messages from the backend
    const [alertMsg, setAlertMsg] = useState<MessageCompProps>({msg_type:'', msg_dts:''}) // the error message
    const animationControl = useAnimationControls()

    // page transition completed, so update 'setPageTransition' to false
    useEffect(() => {
        dispatch(setPageTransition(false))
    }, [dispatch])

    // we don't want a logged in user to be able to view this page
    useEffect(() => {
        if (loggedIn === 'yes') {
            router.push('/')
            animationControl.set({opacity: 0})
        } else {
            animationControl.start({opacity: 1})
        }
    }, [loggedIn, router, animationControl])

    // setting up React Hook Form to handle the forms below(i.e both the login and registration forms)
    const { register: registerReg, handleSubmit: handleRegisterSubmit, setValue: regSetValue, formState: {errors:regError} } = useForm<RegisterRHF>()

    const submitRegistration: SubmitHandler<RegisterRHF> = (data: any) => {
        setIsLoading2(true)

        axios.post(regUrl, data, {headers: {'Content-Type': 'application/json'}})
        .then((res) => {
            setShowAlert(true)
            setAlertMsg({
                'msg_type': res.data.msg,
                'msg_dts': res.data.cause,
                'haveBtn': true,
                'btnList': [
                    {
                        'btnTitle':'login',
                        'btnAction':() => { router.push(urlMap.clientAuth.login) }
                    }
                ]
            })
            setIsLoading2(false)

            // clears all of the input field for registering
            Object.keys(data).forEach((item) => {
                regSetValue(item as "username" | "password" | "name" | "email" | "gender" | "confirm_password", "")
            })
        })
        .catch((err) => {
            const msg_dts = `Status: ${err.response.status}, ${err.response.data.cause}` 
            setShowAlert(true)
            setAlertMsg({'msg_type':'bad', 'msg_dts':msg_dts})
            setIsLoading2(false)
        });
    }

    return (
        <motion.div initial={{opacity: 0}} animate={animationControl}>
            {showAlert && (
                <MessageComp {...alertMsg} closeAlert={setShowAlert} />
            )}
            <div className="pb-10 text-4xl">Hi there!</div>
            <div className="ovrCover flex">
                {/* --START-- the registration section */}
                <div className="w-1/2">
                    <div className="titleUp">Register</div>
                    <form onSubmit={handleRegisterSubmit(submitRegistration)}>
                        <div className="inputCover">
                            <div className="inpTitle font-bold">
                                <label htmlFor="name">name</label>
                            </div>
                            <div className="inpInput">
                                <input id="name" type="text" {...registerReg("name", {required: true})} />
                                {regError.name && <p>This field is required!!!</p>}
                            </div>
                        </div>
                        <div className="inputCover">
                            <div className="inpTitle font-bold">
                                <label htmlFor="username">username</label>
                            </div>
                            <div className="inpInput">
                                <input id='username' type="text" {...registerReg("username", {required: true})} />
                                {regError.username && <p>This field is required!!!</p>}
                            </div>
                        </div>
                        <div className="inputCover">
                            <div className="inpTitle font-bold">
                                <label htmlFor="email">email</label>
                            </div>
                            <div className="inpInput">
                                <input id='email' type="text" {...registerReg("email", {required: true})} />
                                {regError.email && <p>This field is required!!!</p>}
                            </div>
                        </div>
                        <div className="inputCover">
                            <div className="inpTitle font-bold">
                                <label htmlFor="gender">gender</label>
                            </div>
                            <div className="inpInput">
                                <select id='gender' {...registerReg("gender", {required: true})}>
                                    <option value="">Select your gender</option>
                                    <option value="male">male</option>
                                    <option value="female">female</option>
                                </select>
                                {regError.gender && <p>This field is required!!!</p>}
                            </div>
                        </div>
                        <div className="inputCover">
                            <div className="inpTitle">
                                <label htmlFor="password">password</label>
                            </div>
                            <div className="inpInput">
                                <input id="password" type="password" {...registerReg("password", {required: true})} />
                                {regError.password && <p>This field is required!!!</p>}
                            </div>
                        </div>
                        <div className="inputCover">
                            <div className="inpTitle">
                                <label htmlFor="Re-enter Password">Re-enter Password</label>
                            </div>
                            <div className="inpInput">
                                <input id="Re-enter Password" type="password" {...registerReg("confirm_password", {required: true})} />
                                {regError.confirm_password && <p>This field is required!!!</p>}
                            </div>
                        </div>
                        <div className="btnCvr">
                            {!isLoading2 && <button className="general" type="submit">Register</button>}
                            {isLoading2 && <p className='generalBtn'>Loading...</p>}
                        </div>
                    </form>
                </div>
                {/* --END-- */}
            </div>
        </motion.div>
    )
}
