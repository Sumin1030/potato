import { redirect } from "next/navigation";
import { getPasswordChangeAccess } from "../api/get-password-change-access";
import ChangePassword from "./ChangePassword";

export default async function ChangePasswordPage() {
  if (!await getPasswordChangeAccess()) redirect("/menu");
  return <ChangePassword />;
}
