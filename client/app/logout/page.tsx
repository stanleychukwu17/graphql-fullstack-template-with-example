'use client'
import axios from "axios"
import { useCallback, useEffect } from "react"
import { useRouter } from "next/navigation";
import { useAppSelector, useAppDispatch } from "../redux/hook"
import { updateUser } from "../redux/features/userSlice"
import { BACKEND_PORT as backEndPort } from "@/my.config";

const config = {
    headers: {'Content-Type': 'application/json'},
};

export default function LogOutComp() {
    const userInfo = useAppSelector((state) => state.user)
    const dispatch = useAppDispatch()
    const route = useRouter()

    const log_this_user_out = useCallback(() => {
        axios.post(`${backEndPort}/users/logout`, userInfo, config)
        .then((res) => {
            if (res.data.msg === 'okay') {
                localStorage.removeItem('userDts') // delete the localStorage cached user info
                dispatch(updateUser({loggedIn:'no', name:'', session_fid:0})) // delete the redux item

                // no need to send the user to the home page, redux will update the userInfo, the the useEffect below will send the user back to the home page
                // setTimeout(() => { route.push('/') }, 1000) // setTimeout allows redux to finish updating before we redirect to the homePage
            }
        })
        .catch((error) => {
            // console.error('Error:', error.message);
            alert(error.message)
        });
    }, [dispatch, userInfo])

    // checks to make sure that the user is logged in
    useEffect(() => {
        if (userInfo.loggedIn === 'yes') {
            log_this_user_out()
        } else {
            route.push('/') // send them man back to the home page
        }
    }, [log_this_user_out, userInfo.loggedIn, route])

    return (
        <div> </div>
    )
}