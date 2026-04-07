import { Link } from "react-router-dom";

function Login() {
    return (
        <div className="login">
            <div>
                <form id="login-form">
                    <h2>Register</h2>
                    <div className="input-box">
                        <input type="email" id="email" required />
                        <label> Email </label>
                    </div>
                    <div className="input-box">
                        <input type="password" id="password" required />
                        <label> Password </label>
                    </div>

                    <button type="submit"> Login </button>
                    <div className="register-link">
                        <p>
                            Don't have an account? {" "} <Link to="/register">Register</Link>
                        </p>
                    </div>
                </form>
            </div>
        </div>
    );
}
export default Login;