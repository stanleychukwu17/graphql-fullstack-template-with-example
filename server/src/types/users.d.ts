export type userRegisterInfo = {
    name: string;
    username: string;
    email: string;
    password: string;
    gender: 'male'|'female';
}

export type userLoginInfo = Pick<userRegisterInfo, "username" | "password">