import React from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";

const LoginPage = () => {
  return (
    <div className="h-[calc(100vh-105px)] flex items-center justify-center">
      <div className="p-8 border">
        <div className="w-[402px] flex items-center flex-col gap-y-5">
          <h1 className="text-2xl text-center">Login</h1>
          <Input
            type="email"
            className="w-full h-[48px] placeholder:text-xs placeholder:text-muted-foreground placeholder:font-light"
            placeholder="Email"
          />
          <Input
            type="password"
            className="w-full h-[48px] placeholder:text-xs placeholder:text-muted-foreground placeholder:font-light"
            placeholder="Password"
          />
          <Button className="w-full h-[48px] bg-[#1e3820] font-thin hover:bg-[#152717]">
            SIGN IN
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
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
