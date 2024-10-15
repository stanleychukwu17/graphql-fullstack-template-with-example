import Link from "next/link"
import { useCallback } from "react"

import { setPageTransition } from "@/app/redux/features/siteSlice"
import { useAppDispatch } from "@/app/redux/hook"

export default function LoggedOutCard() {
    const dispatch = useAppDispatch()

    // enable page transition loading
    const linkClicked = useCallback(() => dispatch(setPageTransition(true)), [])

    return (
        <div className="flex space-x-8 font-semibold text-[16.5px]">
            <div className="">
                <Link href="/login" onClick={linkClicked}>Register</Link>
            </div>
            <div className="">
                <Link href="/login" onClick={linkClicked}>Login</Link>
            </div>
        </div>
    )
}