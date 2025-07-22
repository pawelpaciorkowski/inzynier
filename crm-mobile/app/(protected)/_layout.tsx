import { Slot } from 'expo-router';
import { AuthProvider } from '../../context/AuthContext';

export default function ProtectedLayout() {
    return (
        <AuthProvider>
            <Slot />
        </AuthProvider>
    );
}