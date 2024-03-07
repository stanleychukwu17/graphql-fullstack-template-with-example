"use client"
import axios from 'axios';
import {useEffect, useLayoutEffect, useState} from "react";
import {useForm, SubmitHandler} from "react-hook-form"
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from "../redux/hook";
import { updateUser } from '../redux/features/userSlice';
import { BACKEND_PORT as backEndPort } from '@/my.config';

import MessageComp, {MessageCompProps} from "../components/Message/MessageComp";

import './page.scss'

type LoginForRHF = {
    username: string
    password: string
}

type RegisterRHF = {
    name: string
    username: string
    email: string
    gender: 'male'|'female'
    password: string
    confirm_password: string
}

export default function LoginPage() {
    const dispatch = useAppDispatch()
    const route = useRouter()
    const [isLoading1, setIsLoading1] = useState<boolean>(false) // used for login
    const [isLoading2, setIsLoading2] = useState<boolean>(false) // used for registering
    const [showAlert, setShowAlert] = useState<boolean>(false) // for showing of error messages from the backend
    const [alertMsg, setAlertMsg] = useState<MessageCompProps>({msg_type:'', msg_dts:''}) // the error message

    // setting up React Hook Form to handle the forms below(i.e both the login and registration forms)
    const { register: registerLogin, handleSubmit: handleLoginSubmit, setValue: loginSetValue, formState: {errors:loginError} } = useForm<LoginForRHF>()
    const { register: registerReg, handleSubmit: handleRegisterSubmit, setValue: regSetValue, formState: {errors:regError} } = useForm<RegisterRHF>()

    const submitLogin: SubmitHandler<LoginForRHF> = async (data) => {
        setIsLoading1(true)

        await axios.post(`${backEndPort}/users/login`, data, {headers: {'Content-Type': 'application/json'}})
        .then((res) => {

            if(res.data.msg === 'okay') {
                localStorage.setItem('userDts', JSON.stringify(res.data));
                dispatch(updateUser({loggedIn: 'yes', ...res.data}))

                // waits a little bit so that redux can finish it's thing and they i can redirect to the home page
                setTimeout(() => {
                    route.push('/')
                }, 500)

                // clears all of the input field for login
                Object.keys(data).forEach((item) => {
                    loginSetValue(item as "username" | "password", "") // RHF hook used here
                })
            } else {
                setShowAlert(true)
                setAlertMsg({'msg_type':res.data.msg, 'msg_dts':res.data.cause})
            }

            setIsLoading1(false)
        })
        .catch((err) => {
            setShowAlert(true)
            setAlertMsg({'msg_type':'bad', 'msg_dts':err.message+', please contact the customer support and report this issue'})
            setIsLoading1(false)
        });
    }

    const submitRegistration: SubmitHandler<RegisterRHF> = (data) => {
        setIsLoading2(true)

        axios.post(`${backEndPort}/users/new_user`, data, {headers: {'Content-Type': 'application/json'}})
        .then((res) => {
            setShowAlert(true)
            setAlertMsg({'msg_type':res.data.msg, 'msg_dts':res.data.cause})
            setIsLoading2(false)

            // clears all of the input field for registering
            Object.keys(data).forEach((item) => {
                regSetValue(item as "username" | "password" | "name" | "email" | "gender" | "confirm_password", "")
            })
        })
        .catch((err) => {
            setShowAlert(true)
            setAlertMsg({'msg_type':'bad', 'msg_dts':err.message+', please contact the customer support and report this issue'})
            setIsLoading2(false)
        });
    }

    return (
        <div className="block relative my-14 padding-x">
            {
                showAlert &&
                <MessageComp {...alertMsg} closeAlert={setShowAlert} />
            }

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
                                <input id='login_input' type="text" {...registerLogin("username", { required: true })} />
                                {loginError.username && <p>This field is required!!!</p>}
                            </div>
                        </div>
                        <div className="inputCover">
                            <div className="inpTitle">
                                <label htmlFor="login_password">Password</label>
                            </div>
                            <div className="inpInput">
                                <input data-testid='login password' type="password" {...registerLogin("password", { required: true })} />
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
                            {!isLoading2 && <button type="submit">Register</button>}
                            {isLoading2 && <p>Loading...</p>}
                        </div>
                    </form>
                </div>
                {/* --END-- */}
            </div>
        </div>
    )
}
