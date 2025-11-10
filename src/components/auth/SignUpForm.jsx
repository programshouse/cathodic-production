// /src/components/auth/SignUpForm.jsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ChevronLeftIcon, EyeCloseIcon, EyeIcon } from "../../icons";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import Checkbox from "../form/input/Checkbox";
import { useAuthStore } from "../../stores/useAuthStore";

export default function SignUpForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const [form, setForm] = useState({ fname: "", lname: "", email: "", password: "" });

  // ✅ Select each piece separately to avoid unstable object refs
  const register = useAuthStore((s) => s.register);
  const loading  = useAuthStore((s) => s.loading);
  const error    = useAuthStore((s) => s.error);

  const navigate = useNavigate();

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const onCheckboxChange = (v) => {
    if (typeof v === "boolean") return setIsChecked(v);
    if (v && typeof v === "object" && "target" in v) return setIsChecked(!!v.target.checked);
    setIsChecked((x) => !x);
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!form.fname || !form.lname || !form.email || !form.password) return;
    if (!isChecked) return;

    const payload = {
      name: `${form.fname} ${form.lname}`.trim(),
      email: form.email.trim(),
      password: form.password,
      password_confirmation: form.password, // remove if backend doesn't need it
    };

    try {
      await register(payload);   // calls Zustand action
      navigate("/");            // success → home/dashboard
    } catch {
      // store already toasts error
    }
  };

  return (
    <div className="flex flex-col flex-1 w-full overflow-y-auto lg:w-1/2 no-scrollbar">
      <div className="w-full max-w-md mx-auto mb-5 sm:pt-10">
        <Link
          to="/"
          className="inline-flex items-center text-sm text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
        >
          <ChevronLeftIcon className="size-5" />
          Back to dashboard
        </Link>
      </div>

      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <div>
          <div className="mb-5 sm:mb-8">
            <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
              Sign Up
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Enter your email and password to sign up!
            </p>
            {error ? (
              <p className="mt-3 text-sm text-error-600 dark:text-error-400">{error}</p>
            ) : null}
          </div>

          <div>
            <form onSubmit={onSubmit}>
              <div className="space-y-5">
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  {/* First Name */}
                  <div className="sm:col-span-1">
                    <Label>
                      First Name<span className="text-error-500">*</span>
                    </Label>
                    <Input
                      type="text"
                      id="fname"
                      name="fname"
                      value={form.fname}
                      onChange={onChange}
                      placeholder="Enter your first name"
                      disabled={loading}
                    />
                  </div>

                  {/* Last Name */}
                  <div className="sm:col-span-1">
                    <Label>
                      Last Name<span className="text-error-500">*</span>
                    </Label>
                    <Input
                      type="text"
                      id="lname"
                      name="lname"
                      value={form.lname}
                      onChange={onChange}
                      placeholder="Enter your last name"
                      disabled={loading}
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <Label>
                    Email<span className="text-error-500">*</span>
                  </Label>
                  <Input
                    type="email"
                    id="email"
                    name="email"
                    value={form.email}
                    onChange={onChange}
                    placeholder="Enter your email"
                    disabled={loading}
                  />
                </div>

                {/* Password */}
                <div>
                  <Label>
                    Password<span className="text-error-500">*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      placeholder="Enter your password"
                      type={showPassword ? "text" : "password"}
                      id="password"
                      name="password"
                      value={form.password}
                      onChange={onChange}
                      disabled={loading}
                    />
                    <span
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
                    >
                      {showPassword ? (
                        <EyeIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                      ) : (
                        <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                      )}
                    </span>
                  </div>
                </div>

                {/* Checkbox */}
                <div className="flex items-center gap-3">
                  <Checkbox
                    className="w-5 h-5"
                    checked={isChecked}
                    onChange={onCheckboxChange}
                    disabled={loading}
                  />
                  <p className="inline-block font-normal text-gray-500 dark:text-gray-400">
                    By creating an account you agree to the{" "}
                    <span className="text-gray-800 dark:text-white/90">Terms and Conditions,</span>{" "}
                    and our <span className="text-gray-800 dark:text-white">Privacy Policy</span>
                  </p>
                </div>

                {/* Button */}
                <div>
                  <button
                    type="submit"
                    disabled={
                      loading ||
                      !isChecked ||
                      !form.fname ||
                      !form.lname ||
                      !form.email ||
                      !form.password
                    }
                    className="flex items-center justify-center w-full px-4 py-3 text-sm font-medium text-white transition rounded-lg bg-brand-500 shadow-theme-xs hover:bg-brand-600 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {loading ? "Creating account..." : "Sign Up"}
                  </button>
                </div>
              </div>
            </form>

            <div className="mt-5">
              <p className="text-sm font-normal text-center text-gray-700 dark:text-gray-400 sm:text-start">
                Already have an account?{" "}
                <Link to="/signin" className="text-brand-500 hover:text-brand-600 dark:text-brand-400">
                  Sign In
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
