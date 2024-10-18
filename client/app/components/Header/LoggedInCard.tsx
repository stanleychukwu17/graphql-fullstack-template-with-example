import Link from "next/link"
import { useAppSelector } from "@/app/utils/redux/hook"
import { urlMappings } from "@/app/utils/url-mappings"

export default function LoggedInCard() {
    const userInfo = useAppSelector(state => state.user)

    return (
        <div className="flex space-x-4 items-center mr-5">
            <div className="w-[55px] h-[55px] border-2 border-white rounded-full"></div>
            <div className="">
                <div className="capitalize">{userInfo.name}</div>
                <div className="text-sm text-[#0056b6] font-bold">
                    <Link href={urlMappings.clientAuth.logout}>Logout</Link>
                </div>
            </div>
        </div>
    )
}