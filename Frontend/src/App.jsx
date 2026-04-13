import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Register from "./components/Register";
import Login from "./components/Login";
import Verify from "./components/Verify";
import Home from "./components/Home";
import ProblemPage from "./components/ProblemPage";

function PrivateRoute({ children }) {
    const token = localStorage.getItem("token");
    return token ? children : <Navigate to="/login" replace />;
}

function App() {
    return (
        <BrowserRouter>
            <Routes>
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

                <Route
                    path="/problem/:id"
                    element={
                        <PrivateRoute>
                            <ProblemPage />
                        </PrivateRoute>
                    }
                />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
