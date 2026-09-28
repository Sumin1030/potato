import { getMenuPermissions } from "../api/get-menu-permissions";
import Menu from "./Menu";

export default async function MenuPage() {
  const canChangePassword = await getMenuPermissions();
  return <Menu canChangePassword={canChangePassword} />;
}
