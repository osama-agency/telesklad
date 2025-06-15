"use client";
import { getSignedURL } from "@/actions/upload";
import {
  CallIcon,
  EmailIcon,
  UploadIcon,
  UserIcon,
} from "@/assets/icons";
import { LoadingButton } from "@/components/ui/button";
import { useSession } from "next-auth/react";
import Image from "next/image";
import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";

interface UserData {
  id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  image: string | null;
  role: string | null;
}

const SettingBoxes = () => {
  const { data: session, update } = useSession();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [file, setFile] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string>("");

  const isDemo = session?.user?.email?.includes("demo-");

  // Fetch user data on component mount
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch("/api/user/get-user");
        if (response.ok) {
          const data = await response.json();
          setUserData(data);
          setPreviewImage(getImageUrl(data.image));
        } else {
          toast.error("Не удалось загрузить данные пользователя");
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        toast.error("Ошибка при загрузке данных");
      } finally {
        setFetchLoading(false);
      }
    };

    if (session?.user) {
      fetchUserData();
    }
  }, [session]);

  const getImageUrl = (imageUrl: string | null) => {
    if (!imageUrl) return "/images/user/user-03.png";
    if (imageUrl.includes("http")) return imageUrl;
    return `${process.env.NEXT_PUBLIC_IMAGE_URL}/${imageUrl}`;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setUserData(prev => prev ? { ...prev, [name]: value } : null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreviewImage(URL.createObjectURL(selectedFile));
    }
  };

  const handleFileUpload = async (file: File) => {
    if (!file) return null;

    try {
      const signedUrl = await getSignedURL(file.type, file.size);

      if (signedUrl.failure !== undefined) {
        toast.error(signedUrl.failure);
        return null;
      }

      const url = signedUrl.success.url;
      const res = await fetch(url, {
        method: "PUT",
        headers: {
          "Content-Type": file.type || "application/octet-stream",
        },
        body: file,
      });

      if (res.status === 200) {
        return signedUrl?.success?.key;
      }
    } catch (error) {
      console.error("Error uploading profile photo:", error);
      toast.error("Не удалось загрузить фото профиля");
    }

    return null;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (isDemo) {
      toast.error("Нельзя обновить демо-пользователя");
      return;
    }

    if (!userData) {
      toast.error("Данные пользователя не загружены");
      return;
    }

    setLoading(true);

    try {
      let uploadedImageUrl = null;
      if (file) {
        uploadedImageUrl = await handleFileUpload(file);
      }

      const requestBody = {
        name: userData.name,
        email: userData.email,
        phone: userData.phone,
        ...(uploadedImageUrl && { image: uploadedImageUrl }),
      };

      const res = await fetch("/api/user/update", {
        method: "POST",
        body: JSON.stringify(requestBody),
        headers: {
          "Content-Type": "application/json",
        },
      });

      const updatedUser = await res.json();

      if (res.ok) {
        toast.success("Профиль успешно обновлен");
        setUserData(updatedUser);
        setFile(null);
        setPreviewImage(getImageUrl(updatedUser.image));
        
        // Update NextAuth session
        await update({
          ...session,
          user: {
            ...session?.user,
            name: updatedUser.name,
            email: updatedUser.email,
            image: updatedUser.image,
          },
        });
      } else {
        toast.error(updatedUser.error || "Не удалось обновить профиль");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Ошибка при обновлении профиля");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveImage = () => {
    setFile(null);
    setPreviewImage(getImageUrl(userData?.image || null));
  };

  if (fetchLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="flex items-center gap-2">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-solid border-primary border-t-transparent"></span>
          <span>Загрузка данных...</span>
        </div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <p className="text-red-500">Не удалось загрузить данные пользователя</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-2 text-primary hover:underline"
          >
            Попробовать снова
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-5 gap-8">
      <div className="col-span-5 xl:col-span-3">
        <div className="rounded-[10px] border border-stroke bg-white shadow-1 dark:border-dark-3 dark:bg-gray-dark dark:shadow-card">
          <div className="border-b border-stroke px-7 py-4 dark:border-dark-3">
            <h3 className="font-medium text-dark dark:text-white">
              Личная информация
            </h3>
          </div>
          <div className="p-7">
            <form onSubmit={handleSubmit}>
              <div className="mb-5.5 flex flex-col gap-5.5 sm:flex-row">
                <div className="w-full sm:w-1/2">
                  <label
                    className="mb-3 block text-body-sm font-medium text-dark dark:text-white"
                    htmlFor="name"
                  >
                    Полное имя
                  </label>
                  <div className="relative">
                    <span className="absolute left-4.5 top-1/2 -translate-y-1/2">
                      <UserIcon />
                    </span>
                    <input
                      className="w-full rounded-lg border-[1.5px] border-stroke bg-white py-2.5 pl-12.5 pr-4.5 text-dark focus:ring-gradient focus-visible:outline-none dark:border-dark-3 dark:bg-dark-2 dark:text-white"
                      type="text"
                      name="name"
                      id="name"
                      placeholder="Иван Иванов"
                      value={userData.name || ""}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div className="w-full sm:w-1/2">
                  <label
                    className="mb-3 block text-body-sm font-medium text-dark dark:text-white"
                    htmlFor="phone"
                  >
                    Номер телефона
                  </label>
                  <div className="relative">
                    <span className="absolute left-4.5 top-1/2 -translate-y-1/2">
                      <CallIcon />
                    </span>
                    <input
                      className="w-full rounded-lg border-[1.5px] border-stroke bg-white py-2.5 pl-12.5 pr-4.5 text-dark focus:ring-gradient focus-visible:outline-none dark:border-dark-3 dark:bg-dark-2 dark:text-white"
                      type="text"
                      name="phone"
                      id="phone"
                      placeholder="+7 999 123 45 67"
                      value={userData.phone || ""}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
              </div>

              <div className="mb-5.5">
                <label
                  className="mb-3 block text-body-sm font-medium text-dark dark:text-white"
                  htmlFor="email"
                >
                  Email адрес
                </label>
                <div className="relative">
                  <span className="absolute left-4.5 top-1/2 -translate-y-1/2">
                    <EmailIcon />
                  </span>
                  <input
                    className="w-full rounded-lg border-[1.5px] border-stroke bg-white py-2.5 pl-12.5 pr-4.5 text-dark focus:ring-gradient focus-visible:outline-none dark:border-dark-3 dark:bg-dark-2 dark:text-white"
                    type="email"
                    name="email"
                    id="email"
                    placeholder="ivan.ivanov@example.com"
                    value={userData.email || ""}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <LoadingButton
                  variant="outline"
                  size="sm"
                  type="button"
                  onClick={handleRemoveImage}
                >
                  Сбросить
                </LoadingButton>
                <LoadingButton
                  variant="primary"
                  size="sm"
                  type="submit"
                  isLoading={loading}
                  loadingText="Сохранение..."
                >
                  Сохранить
                </LoadingButton>
              </div>
            </form>
          </div>
        </div>
      </div>

      <div className="col-span-5 xl:col-span-2">
        <div className="rounded-[10px] border border-stroke bg-white shadow-1 dark:border-dark-3 dark:bg-gray-dark dark:shadow-card">
          <div className="border-b border-stroke px-7 py-4 dark:border-dark-3">
            <h3 className="font-medium text-dark dark:text-white">
              Ваше фото
            </h3>
          </div>
          <div className="p-7">
            <div className="mb-4 flex items-center gap-3">
              <Image
                src={previewImage}
                width={55}
                height={55}
                alt="User"
                className="size-14 rounded-full object-cover"
                quality={90}
              />
              <div>
                <span className="mb-1.5 font-medium text-dark dark:text-white">
                  Редактировать фото
                </span>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="text-body-sm hover:text-red"
                  >
                    Удалить
                  </button>
                  <button
                    type="button"
                    onClick={() => document.getElementById('profilePhoto')?.click()}
                    className="text-body-sm hover:text-primary"
                  >
                    Обновить
                  </button>
                </div>
              </div>
            </div>

            <div
              id="FileUpload"
              className="relative mb-5.5 block w-full cursor-pointer appearance-none rounded-xl border border-dashed border-gray-4 bg-gray-2 px-4 py-4 hover:border-primary dark:border-dark-3 dark:bg-dark-2 dark:hover:border-primary sm:py-7.5"
            >
              <input
                type="file"
                name="profilePhoto"
                id="profilePhoto"
                onChange={handleFileChange}
                accept="image/png, image/jpg, image/jpeg"
                className="absolute inset-0 z-50 m-0 h-full w-full cursor-pointer p-0 opacity-0 outline-none"
              />
              <div className="flex flex-col items-center justify-center">
                <div className="flex h-13.5 w-13.5 items-center justify-center rounded-full border border-stroke bg-white dark:border-dark-3 dark:bg-gray-dark">
                  <UploadIcon />
                </div>
                <p className="mt-2.5 text-body-sm font-medium">
                  <span className="text-primary">Нажмите для загрузки</span> или
                  перетащите файл
                </p>
                <p className="mt-1 text-body-xs">
                  SVG, PNG, JPG или GIF (макс. 800 X 800px)
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <LoadingButton
                variant="outline"
                size="sm"
                type="button"
                onClick={handleRemoveImage}
              >
                Отмена
              </LoadingButton>
              <LoadingButton
                variant="primary"
                size="sm"
                type="button"
                isLoading={loading}
                loadingText="Сохранение..."
                onClick={(e) => {
                  e.preventDefault();
                  const form = document.querySelector('form') as HTMLFormElement;
                  if (form) form.requestSubmit();
                }}
              >
                Сохранить
              </LoadingButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingBoxes;
