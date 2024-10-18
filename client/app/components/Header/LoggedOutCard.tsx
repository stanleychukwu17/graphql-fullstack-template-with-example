import Link from "next/link"
import { useCallback } from "react"

import { setPageTransition } from "@/app/utils/redux/features/siteSlice"
import { useAppDispatch } from "@/app/utils/redux/hook"
import { urlMap } from "@/app/utils/url-mappings"

export default function LoggedOutCard() {
    const dispatch = useAppDispatch()

    // enable page transition loading
    const linkClicked = useCallback(() => dispatch(setPageTransition(true)), [dispatch])

    return (
        <div className="flex space-x-8 font-semibold text-[16.5px]">
            <div className="">
                <Link href={urlMap.clientAuth.register} onClick={linkClicked}>Register</Link>
            </div>
            <div className="">
                <Link href={urlMap.clientAuth.login} onClick={linkClicked}>Login</Link>
            </div>
        </div>
    )
}