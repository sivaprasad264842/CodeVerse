import { Link } from "react-router-dom";

function Register() {
    return (
        <div className="register">
            <div>
                <form id="registration-form">
                    <h2>Register</h2>
                    <div className="input-box">
                        <input type="email" id="email" required />
                        <label> Email </label>
                    </div>
                    <div className="input-box">
                        <input type="password" id="password" required />
                        <label> Password </label>
                    </div>
                    <div className="input-box">
                        <input type="password" id="confirm-password" required />
                        <label> Confirm Password </label>
                    </div>

                    <button type="submit"> Register </button>
                    <div className="register-link">
                        <p>
                            Already have an account?{" "}
                            <Link to="/login">Login</Link>
                        </p>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default Register;
