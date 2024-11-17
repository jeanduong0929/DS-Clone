"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRegister } from "@/features/auth/api/use-register";
import { Loader2 } from "lucide-react";

const RegisterPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  const { mutate, isPending } = useRegister();

  const router = useRouter();

  /**
   * Validates the registration form inputs for email and password.
   *
   * The function checks if the email matches a standard email format
   * and if the password meets the required criteria:
   * - At least 8 characters long
   * - Contains at least one uppercase letter
   * - Contains at least one lowercase letter
   * - Contains at least one digit
   * - Contains at least one special character (e.g., @$!%*?&)
   *
   * If the email or password is invalid, an error message is set
   * and the function returns false. If both are valid, it clears
   * any existing error messages and returns true.
   *
   * @returns {boolean} - Returns true if the form is valid, false otherwise.
   */
  const isValidForm = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

    if (!emailRegex.test(email)) {
      setError("Invalid email");
      return false;
    }

    if (!passwordRegex.test(password)) {
      setError("Invalid password");
      return false;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return false;
    }

    setError("");
    return true;
  };

  /**
   * Handles the form submission for user registration.
   *
   * This function first validates the registration form inputs by calling
   * the `isValidForm` function. If the form is not valid, it returns early
   * without proceeding. If the form is valid, it triggers the `mutate` function
   * from the `useRegister` hook to send the registration request with the
   * provided email and password.
   *
   * On a successful registration, it clears the form fields and redirects
   * the user to the login page. If an error occurs during the registration
   * process, it sets the error message to be displayed to the user.
   */
  const handleOnSubmit = () => {
    if (!isValidForm()) return;

    mutate(
      {
        email,
        password,
      },
      {
        onSuccess: () => {
          clearForm();
          router.push("/account/login");
        },
        onError: (error) => {
          setError(error.message);
        },
      }
    );
  };

  /**
   * Clears the registration form fields and resets the error message.
   *
   * This function sets the email, password, and confirm password fields
   * to empty strings and clears any error messages. It is typically called
   * after a successful registration to reset the form for new input.
   */
  const clearForm = () => {
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setError("");
  };

  return (
    <div className="h-[calc(100vh-105px)] flex items-center justify-center">
      <div className="p-8 border">
        <div className="w-[402px] flex items-center flex-col gap-y-5">
          <h1 className="text-2xl text-center">CREATE ACCOUNT</h1>
          {error && <p className="text-red-500 text-sm font-light">{error}</p>}
          <Input
            type="email"
            className="w-full h-[48px] placeholder:text-xs placeholder:text-muted-foreground placeholder:font-light"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Input
            type="password"
            className="w-full h-[48px] placeholder:text-xs placeholder:text-muted-foreground placeholder:font-light"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Input
            type="password"
            className="w-full h-[48px] placeholder:text-xs placeholder:text-muted-foreground placeholder:font-light"
            placeholder="Confirm password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          <Button
            className="w-full h-[48px] bg-[#1e3820] font-thin hover:bg-[#152717]"
            onClick={handleOnSubmit}
            disabled={isPending}
          >
            {isPending ? <Loader2 className="animate-spin size-5" /> : "CREATE"}
          </Button>

          <div className="text-sm font-light">
            <Link href={"/"} className="underline hover:text-muted-foreground">
              Return to store
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
