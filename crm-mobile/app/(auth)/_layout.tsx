import { Slot } from 'expo-router';
import { AuthProvider } from '../../context/AuthContext';

export default function AuthLayout() {
    return (
        <AuthProvider>
            <Slot />
        </AuthProvider>
    );
}