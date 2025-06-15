import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import SettingBoxes from "@/components/SettingBoxes";
import { Metadata } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/libs/auth";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Настройки",
};

export default async function SettingsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div className="mx-auto w-full max-w-[1080px]">
      <Breadcrumb pageName="Настройки" />
      <SettingBoxes />
    </div>
  );
}

