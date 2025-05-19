// src/components/PrivateRoute.tsx
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import type { JSX } from "react";

const PrivateRoute = ({ children }: { children: JSX.Element }) => {
    const { user } = useAuth();

    if (!user) {
        return <Navigate to="/" />; // Jeśli użytkownik nie jest zalogowany, przekierowanie do logowania
    }

    return children ? children : <Outlet />;
};

export default PrivateRoute;
