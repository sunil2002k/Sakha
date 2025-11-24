import React, { useState, useContext } from "react";
import { AuthContext } from '../contexts/AuthContext';
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function Signup() {
  const { signup } = useContext(AuthContext);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "",
    institution: "",
    terms: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const APIURL = import.meta.env.VITE_APP_URL;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = "Full name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    } else {
      // Check if email already exists
      const existingUsers = JSON.parse(
        localStorage.getItem("registeredUsers") || "[]"
      );
      if (existingUsers.find((user) => user.email === formData.email)) {
        newErrors.email =
          "Email already registered. Please use a different email or login.";
      }
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    if (!formData.role) {
      newErrors.role = "Please select your role";
    }

    if (!formData.terms) {
      newErrors.terms = "You must agree to the terms and conditions";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
  if (!validateForm()) {
    return;
  }

  setIsLoading(true);

  try {
    const response = await axios.post(`${APIURL}/api/v1/auth/sign-up`, {
      fullName: formData.fullName,
      email: formData.email,
      password: formData.password,
      role: formData.role,
      institution: formData.institution,
    });

    // If backend returns success
    if (response.data.success) {
      if (signup) {
        signup({
          username: formData.fullName,
          email: formData.email,
          role: formData.role,
          institution: formData.institution,
        });
      }

      alert("Account created successfully!");
      navigate("/login");
    } else {
      setErrors({ general: response.data.message });
    }

  } catch (error) {
    console.error("Signup error:", error);
    setErrors({
      general:
        error.response?.data?.message || "Something went wrong. Please try again.",
    });
  } finally {
    setIsLoading(false);
  }
};


  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div
      className="font-display antialiased min-h-screen overflow-hidden"
      style={{ backgroundColor: "#020618" }}
    >
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl"></div>
      </div>

      <div className="flex min-h-screen">
        {/* Left side - Hero section */}
        <div className="hidden lg:flex w-1/2 flex-col items-center justify-center p-12 text-white relative">
          <div className="z-10 text-center max-w-md">
            <div className="mb-8">
              <div className="w-16 h-16 mx-auto bg-gradient-to-r from-blue-500 to-purple-600 rounded-3xl flex items-center justify-center shadow-xl">
                <span className="text-white font-bold text-2xl">I</span>
              </div>
            </div>
            <h1 className="text-4xl font-bold mb-4">Welcome to InnovateU</h1>
            <p className="text-xl text-gray-300 leading-relaxed">
              Join the premier platform for student innovation. Connect,
              collaborate, and create the future.
            </p>
            <div className="mt-8 space-y-4">
              <div className="flex items-center gap-3 text-gray-300">
                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                <span>Connect with innovators worldwide</span>
              </div>
              <div className="flex items-center gap-3 text-gray-300">
                <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                <span>Access mentorship opportunities</span>
              </div>
              <div className="flex items-center gap-3 text-gray-300">
                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                <span>Showcase your projects</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right side - Form */}
        <main className="w-full lg:w-1/2 flex flex-col items-center justify-center py-12 px-6 lg:px-12 relative z-10">
          <div className="w-full max-w-lg">
            {/* Header */}
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-white mb-3">
                Create Account
              </h2>
              <p className="text-gray-400">
                Join a community of innovators.{" "}
                <a
                  className="font-medium text-blue-400 hover:text-blue-300 transition-colors"
                  href="/login"
                >
                  Already have an account?
                </a>
              </p>
            </div>

            {/* Form */}
            <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl p-8 shadow-2xl">
              <div className="space-y-6">
                {/* General Error Message */}
                {errors.general && (
                  <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-center">
                    <p className="text-red-400 text-sm">{errors.general}</p>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Full Name */}
                  <div className="md:col-span-2">
                    <label
                      className="block text-sm font-medium text-gray-300 mb-2"
                      htmlFor="fullName"
                    >
                      Full Name
                    </label>
                    <input
                      className={`w-full h-12 px-4 bg-white/5 border border-white/20 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-400 focus:bg-white/10 transition-all duration-300 ${
                        errors.fullName
                          ? "border-red-500 focus:border-red-500"
                          : ""
                      }`}
                      id="fullName"
                      name="fullName"
                      placeholder="John Doe"
                      required
                      type="text"
                      value={formData.fullName}
                      onChange={handleChange}
                    />
                    {errors.fullName && (
                      <p className="mt-2 text-sm text-red-400">
                        {errors.fullName}
                      </p>
                    )}
                  </div>

                  {/* Email */}
                  <div className="md:col-span-2">
                    <label
                      className="block text-sm font-medium text-gray-300 mb-2"
                      htmlFor="email"
                    >
                      Email Address
                    </label>
                    <input
                      className={`w-full h-12 px-4 bg-white/5 border border-white/20 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-400 focus:bg-white/10 transition-all duration-300 ${
                        errors.email
                          ? "border-red-500 focus:border-red-500"
                          : ""
                      }`}
                      id="email"
                      name="email"
                      placeholder="you@example.com"
                      required
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                    />
                    {errors.email && (
                      <p className="mt-2 text-sm text-red-400">
                        {errors.email}
                      </p>
                    )}
                  </div>

                  {/* Password */}
                  <div>
                    <label
                      className="block text-sm font-medium text-gray-300 mb-2"
                      htmlFor="password"
                    >
                      Password
                    </label>
                    <div className="relative">
                      <input
                        className={`w-full h-12 px-4 pr-12 bg-white/5 border border-white/20 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-400 focus:bg-white/10 transition-all duration-300 ${
                          errors.password
                            ? "border-red-500 focus:border-red-500"
                            : ""
                        }`}
                        id="password"
                        name="password"
                        placeholder="••••••••"
                        required
                        type={showPassword ? "text" : "password"}
                        value={formData.password}
                        onChange={handleChange}
                      />
                      <button
                        className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-400 hover:text-white transition-colors"
                        type="button"
                        onClick={togglePasswordVisibility}
                      >
                        <svg
                          className="w-5 h-5"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          {showPassword ? (
                            <path
                              fillRule="evenodd"
                              d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z"
                              clipRule="evenodd"
                            />
                          ) : (
                            <>
                              <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                              <path
                                fillRule="evenodd"
                                d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                                clipRule="evenodd"
                              />
                            </>
                          )}
                        </svg>
                      </button>
                    </div>
                    {errors.password && (
                      <p className="mt-2 text-sm text-red-400">
                        {errors.password}
                      </p>
                    )}
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label
                      className="block text-sm font-medium text-gray-300 mb-2"
                      htmlFor="confirmPassword"
                    >
                      Confirm Password
                    </label>
                    <input
                      className={`w-full h-12 px-4 bg-white/5 border border-white/20 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-400 focus:bg-white/10 transition-all duration-300 ${
                        errors.confirmPassword
                          ? "border-red-500 focus:border-red-500"
                          : ""
                      }`}
                      id="confirmPassword"
                      name="confirmPassword"
                      placeholder="••••••••"
                      required
                      type="password"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                    />
                    {errors.confirmPassword && (
                      <p className="mt-2 text-sm text-red-400">
                        {errors.confirmPassword}
                      </p>
                    )}
                  </div>

                  {/* Role Selection */}
                  <div className="md:col-span-2">
                    <label
                      className="block text-sm font-medium text-gray-300 mb-2"
                      htmlFor="role"
                    >
                      Select Your Role
                    </label>
                    <select
                      className={`w-full h-12 px-4 bg-white/5 border border-white/20 rounded-xl text-white focus:outline-none focus:border-blue-400 focus:bg-white/10 transition-all duration-300 ${
                        errors.role ? "border-red-500 focus:border-red-500" : ""
                      }`}
                      id="role"
                      name="role"
                      required
                      value={formData.role}
                      onChange={handleChange}
                    >
                      <option
                        disabled
                        value=""
                        className="bg-gray-800 text-gray-400"
                      >
                        Choose your role
                      </option>
                      <option
                        value="student"
                        className="bg-gray-800 text-white"
                      >
                        Student
                      </option>
                      <option value="mentor" className="bg-gray-800 text-white">
                        Mentor
                      </option>
                      <option
                        value="investor"
                        className="bg-gray-800 text-white"
                      >
                        Investor
                      </option>
                    </select>
                    {errors.role && (
                      <p className="mt-2 text-sm text-red-400">{errors.role}</p>
                    )}
                  </div>

                  {/* Institution */}
                  <div className="md:col-span-2">
                    <label
                      className="block text-sm font-medium text-gray-300 mb-2"
                      htmlFor="institution"
                    >
                      Institution (Optional)
                    </label>
                    <input
                      className="w-full h-12 px-4 bg-white/5 border border-white/20 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-400 focus:bg-white/10 transition-all duration-300"
                      id="institution"
                      name="institution"
                      placeholder="Your University or Company"
                      type="text"
                      value={formData.institution}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                {/* Terms and Conditions */}
                <div className="flex items-start pt-4">
                  <div className="flex h-5 items-center">
                    <input
                      className={`h-4 w-4 rounded border-white/20 bg-white/5 text-blue-500 focus:ring-blue-500 focus:ring-offset-0 ${
                        errors.terms ? "border-red-500 focus:ring-red-500" : ""
                      }`}
                      id="terms"
                      name="terms"
                      required
                      type="checkbox"
                      checked={formData.terms}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <label
                      className="font-medium text-gray-300"
                      htmlFor="terms"
                    >
                      I agree to the{" "}
                      <a
                        className="text-blue-400 hover:text-blue-300 transition-colors"
                        href="#"
                      >
                        Terms & Conditions
                      </a>
                    </label>
                    {errors.terms && (
                      <p className="mt-1 text-sm text-red-400">
                        {errors.terms}
                      </p>
                    )}
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  className="w-full h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl text-white font-semibold hover:shadow-xl hover:shadow-blue-500/25 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-transparent transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  type="button"
                  onClick={handleSubmit}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Creating Account...
                    </div>
                  ) : (
                    "Create Account"
                  )}
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
