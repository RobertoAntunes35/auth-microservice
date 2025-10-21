export interface IResponse {
    status: number,
    message: string,
    accessToken?: string,
    refreshToken?: string,
}



export interface IResponseLogout {
    status: number,
    message: string
}

export interface IUserResponse {
    status: number;
    user: {
        id: number,
        name: string,
        email: string
    }
}