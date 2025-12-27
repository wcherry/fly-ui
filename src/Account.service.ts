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

