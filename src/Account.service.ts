import axios from 'axios';

interface LoginResponse {
    status: string;
    token: string;
    user: {
        id: string;
        username: string;
        emailAddress: string;
        folderId: string;
        active: boolean;
    };
}

export async function login(username: string, password: string): Promise<LoginResponse> {
    try {
        const response = await axios.post<LoginResponse>('/api/auth/login', {
            username,
            password,
        });
        return response.data;
    } catch (error) {
        console.error('Login failed:', error);
        throw error;
    }
}


export async function registerUser(username: string, password: string, emailAddress: string): Promise<LoginResponse> {
    try {
        const response = await axios.post<LoginResponse>('/api/auth/register', {
            username,
            password,
            email: emailAddress
        });
        console.log('Registration response:', response.data);
        return response.data;
    } catch (error) {
        console.error('Registration failed:', error);
        throw error;
    }
}
