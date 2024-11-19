"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLogin } from "@/features/auth/api/use-login";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string>("");

  const { mutate, isPending } = useLogin();

  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect");

  /**
   * Handles the form submission for the login process.
   *
   * This function is triggered when the user submits the login form.
   * It prevents the default form submission behavior, then calls the
   * `mutate` function to attempt logging in with the provided email
   * and password. On a successful login, it clears the form fields
   * and redirects the user to the home page. If an error occurs during
   * the login process, it sets the error message to be displayed to the user.
   *
   * @param {React.FormEvent<HTMLFormElement>} e - The form event object.
   */
  const handleOnSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    mutate(
      { email, password },
      {
        onSuccess: () => {
          clearForm();
          router.push(redirectUrl || "/");
        },
        onError: (error) => {
          setError(error.message);
        },
      }
    );
  };

  /**
   * Clears the login form fields and resets the error message.
   *
   * This function sets the email and password fields to empty strings
   * and clears any error messages. It is typically called after a
   * successful login to reset the form for new input.
   */
  const clearForm = () => {
    setEmail("");
    setPassword("");
    setError("");
  };

  return (
    <div className="h-[calc(100vh-105px)] flex items-center justify-center">
      <div className="p-8 border">
        <form
          className="w-[402px] flex items-center flex-col gap-y-5"
          onSubmit={handleOnSubmit}
        >
          <h1 className="text-2xl text-center">Login</h1>
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
          <Button
            type="submit"
            className="w-full h-[48px] bg-[#1e3820] font-thin hover:bg-[#152717]"
            disabled={isPending}
          >
            {isPending ? (
              <Loader2 className="animate-spin size-5" />
            ) : (
              "SIGN IN"
            )}
          </Button>

          <div className="flex items-center gap-x-2 text-sm font-light">
            <Link
              href={"/account/register"}
              className="underline hover:text-muted-foreground"
            >
              Create an account
            </Link>
            <span>/</span>
            <Link
              href={"/account/forgot-password"}
              className="underline hover:text-muted-foreground"
            >
              Forgot password?
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
