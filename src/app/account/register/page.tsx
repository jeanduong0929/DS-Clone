import React from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";

const RegisterPage = () => {
  return (
    <div className="h-[calc(100vh-105px)] flex items-center justify-center">
      <div className="p-8 border">
        <div className="w-[402px] flex items-center flex-col gap-y-5">
          <h1 className="text-2xl text-center">CREATE ACCOUNT</h1>
          <Input
            type="text"
            className="w-full h-[48px] placeholder:text-xs placeholder:text-muted-foreground placeholder:font-light"
            placeholder="First Name"
          />
          <Input
            type="text"
            className="w-full h-[48px] placeholder:text-xs placeholder:text-muted-foreground placeholder:font-light"
            placeholder="Last Name"
          />
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
            CREATE
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
