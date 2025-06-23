"use client";

import { ChevronUpIcon } from "@/assets/icons";
import {
  Dropdown,
  DropdownContent,
  DropdownTrigger,
} from "@/components/ui/dropdown";
import { cn } from "@/lib/utils";
import { signOut, useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { LogOutIcon, SettingsIcon } from "./icons";
import { useUserData } from "@/hooks/useUserData";

// Компонент скелетона для аватара
const AvatarSkeleton = () => (
  <div className="relative h-12 w-12 rounded-full bg-gray-200 animate-pulse">
    <div className="absolute inset-0 rounded-full bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 animate-pulse"></div>
  </div>
);

// Компонент скелетона для всего UserInfo
const UserInfoSkeleton = () => (
  <div className="flex items-center gap-4">
    <AvatarSkeleton />
    <div className="hidden text-right lg:block">
      <div className="h-4 w-20 bg-gray-200 rounded animate-pulse mb-1"></div>
      <div className="h-3 w-16 bg-gray-200 rounded animate-pulse"></div>
    </div>
    <div className="h-4 w-4 bg-gray-200 rounded animate-pulse"></div>
  </div>
);

export function UserInfo() {
  const [isOpen, setIsOpen] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  const { data: session } = useSession();
  const { userData, loading } = useUserData();

  // Показываем скелетон пока загружаются данные пользователя
  if (loading || !session) {
    return <UserInfoSkeleton />;
  }

  const USER = {
    name: userData?.name || session?.user.name || "Admin User",
    email: userData?.email || session?.user.email || "admin@example.com",
    image: userData?.image || session?.user?.image || "/images/user/user-01.png",
  };

  const handleImageLoad = () => {
    setImageLoading(false);
  };

  const handleImageError = () => {
    setImageLoading(false);
    setImageError(true);
  };

  return (
    <Dropdown isOpen={isOpen} setIsOpen={setIsOpen}>
      <DropdownTrigger className="flex items-center gap-4 cursor-pointer">
        <div className="relative h-12 w-12">
          {imageLoading && <AvatarSkeleton />}
          <Image
            src={imageError ? "/images/user/user-01.png" : USER.image}
            alt="User Avatar"
            width={48}
            height={48}
            className={cn(
              "rounded-full object-cover transition-opacity duration-200",
              imageLoading ? "opacity-0 absolute inset-0" : "opacity-100"
            )}
            onLoad={handleImageLoad}
            onError={handleImageError}
            priority
          />
        </div>

        <div className="hidden text-right lg:block">
          <span className="block text-sm font-medium text-black dark:text-white">
            {USER.name}
          </span>
          <span className="block text-xs text-gray-500">{USER.email}</span>
        </div>

        <ChevronUpIcon
          className={cn(
            "hidden fill-current transition-transform duration-200 sm:block",
            isOpen && "rotate-180"
          )}
        />
      </DropdownTrigger>

      <DropdownContent align="end" className="w-62.5 rounded-sm border border-stroke bg-white py-6 shadow-default dark:border-strokedark dark:bg-boxdark">
        <ul className="flex flex-col gap-5 border-b border-stroke px-6 pb-6 dark:border-strokedark">
          <li>
            <Link
              href="/pages/settings"
              className="flex items-center gap-3.5 text-sm font-medium duration-300 ease-in-out hover:text-primary lg:text-base"
              onClick={() => setIsOpen(false)}
            >
              <SettingsIcon />
              Настройки аккаунта
            </Link>
          </li>
        </ul>
        <button
          onClick={() => {
            setIsOpen(false);
            signOut();
          }}
          className="flex items-center gap-3.5 px-6 py-4 text-sm font-medium duration-300 ease-in-out hover:text-primary lg:text-base"
        >
          <LogOutIcon />
          Выйти
        </button>
      </DropdownContent>
    </Dropdown>
  );
}
