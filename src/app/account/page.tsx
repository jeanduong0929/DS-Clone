"use client";

import { Button } from "@/components/ui/button";
import { useLogout } from "@/features/auth/api/use-logout";

const AccountPage = () => {
  const { mutate: logout } = useLogout();

  const handleLogout = () => {
    logout({});
  };

  return (
    <div>
      <Button onClick={handleLogout}>Logout</Button>
    </div>
  );
};

export default AccountPage;
