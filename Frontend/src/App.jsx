import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Register from "./components/Register";
import Login from "./components/Login";
import Verify from "./components/Verify"; // ✅ FIXED
import Home from "./components/Home";

function PrivateRoute({ children }) {
    const token = localStorage.getItem("token");

    // 🔥 optional improvement: check token existence properly
    return token ? children : <Navigate to="/login" replace />;
}

function App() {
    return (
        <BrowserRouter>
            <Routes>
                {/* ✅ Better default route */}
                <Route path="/" element={<Navigate to="/login" replace />} />

                <Route path="/register" element={<Register />} />
                <Route path="/verify/:token" element={<Verify />} />
                <Route path="/login" element={<Login />} />

                <Route
                    path="/home"
                    element={
                        <PrivateRoute>
                            <Home />
                        </PrivateRoute>
                    }
                />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
