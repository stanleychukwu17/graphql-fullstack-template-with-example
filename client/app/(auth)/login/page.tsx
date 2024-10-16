import './page.scss'
import LoginComponent from '@/app/components/auth/login/LoginComp';
import { siteName } from '@/app/utils/url-mappings'

// page metadata
export const metadata = {
    title: `Login | ${siteName}`,
    description: 'Login Page',
}

export default function LoginPage() {
    return (
        <div className="block relative my-14 padding-x">
            <LoginComponent />
        </div>
    )
}