import { useState } from "react";
import InputField from "../../components/UI/InputField";

const INITIAL_ERRORS = {
  email: "",
  password: "",
};

function Login() {
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState(INITIAL_ERRORS);

  
  const handleEmailChange = (e) => {
    setEmail(e.target.value);

    setErrors((prev) => ({
      ...prev,
      email: "",
    }));
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);

    setErrors((prev) => ({
      ...prev,
      password: "",
    }));
  };

 
  const validateForm = () => {
    const newErrors = { ...INITIAL_ERRORS };

    if (!email.trim()) {
      newErrors.email = "Email is required";
    }

    if (!password.trim()) {
      newErrors.password = "Password is required";
    }

    setErrors(newErrors);

    return (
      newErrors.email === "" &&
      newErrors.password === ""
    );
  };

  // ==========================
  // Submit
  // ==========================
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    console.log({
      email,
      password,
    });

    // Next Sprint:
    // await loginUser(email, password);
  };

  // ==========================
  // JSX
  // ==========================
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-lg">

        <h1 className="mb-6 text-center text-3xl font-bold">
          Login
        </h1>

        <form onSubmit={handleSubmit}>

          <InputField
            label="Email"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={handleEmailChange}
            error={errors.email}
          />

          <InputField
            label="Password"
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={handlePasswordChange}
            error={errors.password}
          />

          <button
            type="submit"
            className="mt-4 w-full rounded-lg bg-green-600 p-3 font-semibold text-white transition hover:bg-green-700"
          >
            Login
          </button>

        </form>

        {/* Debug Section (Remove before production) */}
        <div className="mt-6 rounded-lg bg-gray-100 p-4">
          <p>
            <strong>Email:</strong> {email}
          </p>

          <p>
            <strong>Password:</strong> {password}
          </p>
        </div>

      </div>
    </div>
  );
}

export default Login;