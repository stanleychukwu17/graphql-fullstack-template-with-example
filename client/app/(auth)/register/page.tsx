import './page.scss'
import RegComponent from '@/app/components/auth/register/regComponent';
import { siteName } from '@/app/utils/url-mappings'

// page metadata
export const metadata = {
    title: `Register | ${siteName}`,
    description: 'Login Page',
}

export default function RegisterPage() {
    return (
        <div className="block relative my-14 padding-x">
            <RegComponent />
        </div>
    )
}