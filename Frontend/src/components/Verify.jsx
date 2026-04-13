import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../api";

function Verify() {
    const { token } = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        const verifyEmail = async () => {
            try {
                await API.get(`/auth/verify/${token}`);

                
                navigate("/login?verified=true");
            } catch (err) {
                const errorMsg = err.response?.data?.msg;

                
                if (errorMsg === "Already verified") {
                    navigate("/login?already=true");
                } else {
                    navigate("/login?error=verification_failed");
                }
            }
        };

        verifyEmail();
    }, [token, navigate]);

    return <h2>Verifying your email...</h2>;
}

export default Verify;
