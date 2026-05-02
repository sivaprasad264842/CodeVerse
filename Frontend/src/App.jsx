import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Register from "./components/Register";
import Login from "./components/Login";
import Verify from "./components/Verify";
import Home from "./components/Home";
import ProblemPage from "./components/ProblemPage";

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Home />} />

                <Route path="/register" element={<Register />} />
                <Route path="/verify/:token" element={<Verify />} />
                <Route path="/login" element={<Login />} />

                <Route path="/home" element={<Navigate to="/" replace />} />

                <Route path="/problem/:id" element={<ProblemPage />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
