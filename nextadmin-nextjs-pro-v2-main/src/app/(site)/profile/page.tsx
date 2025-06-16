"use client";

import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import Image from "next/image";
import React from "react";

import { getSignedURL } from "@/actions/upload";
import { useSession } from "next-auth/react";
import { useState } from "react";
import toast from "react-hot-toast";
import { CameraIcon } from "./_components/icons";
import { SocialAccounts } from "./_components/social-accounts";

export default function Page() {
  const { data: session, update } = useSession();

  const profilePic = session?.user?.image
    ? session?.user?.image.includes("http")
      ? session?.user?.image
      : `${process.env.NEXT_PUBLIC_IMAGE_URL}/${session?.user?.image}`
    : "/images/user/user-03.png";

  const coverPic = session?.user?.coverImage
    ? session?.user?.coverImage.includes("http")
      ? session?.user?.coverImage
      : `${process.env.NEXT_PUBLIC_COVER_IMAGE_URL}/${session?.user?.coverImage}`
    : "/images/cover/cover-01.png";

  const [data, setData] = useState({
    name: session?.user.name as string,
    email: "",
    profilePhoto: profilePic,
    coverPhoto: coverPic,
  });

  const [file, setFile] = useState<File>();
  const [loading, setLoading] = useState(false);
  const isDemo = session?.user?.email?.includes("demo-");

  const handleChange = (e: any) => {
    if (e.target.name === "profilePhoto") {
      const file = e.target?.files[0];
      setData({
        ...data,
        profilePhoto: file && URL.createObjectURL(file),
      });
      setFile(file);
    } else {
      setData({
        ...data,
        [e.target.name]: e.target.value,
      });
    }

    if (e.target.name === "coverPhoto") {
      const file = e.target?.files[0];
      setData({
        ...data,
        coverPhoto: file && URL.createObjectURL(file),
      });
      setFile(file);
    } else {
      setData({
        ...data,
        [e.target.name]: e.target.value,
      });
    }
  };

  const handleFileUpload = async (file: any) => {
    if (!file) {
      return null;
    }

    const signedUrl = await getSignedURL(file.type, file.size);

    if (signedUrl.failure !== undefined) {
      toast.error(signedUrl.failure);
      setFile(undefined);
      setData({
        ...data,
        profilePhoto: "",
        coverPhoto: "",
      });
      return null;
    }

    const url = signedUrl.success.url;

    try {
      const res = await fetch(url, {
        method: "PUT",
        headers: {
          "Content-Type": file.type || "application/octet-stream",
        },
        body: file,
      });

      if (res.status === 200) {
        // toast.success("Profile photo uploaded successfully");
        return signedUrl?.success?.key;
      }
    } catch (error) {
      console.error("Error uploading profile photo:", error);
      toast.error("Failed to upload profile photo");
    }

    return null;
  };

  const updateUserProfile = async (
    data: any,
    uploadedImageUrl: string,
    uploadedCoverImageUrl: string,
  ) => {
    try {
      const requestBody = {
        name: data.name,
        email: data.email,
        image: "",
        coverImage: "",
      };

      if (uploadedImageUrl) {
        requestBody.image = uploadedImageUrl;
        requestBody.coverImage = uploadedCoverImageUrl;
      }

      const res = await fetch("/api/user/update", {
        method: "POST",
        body: JSON.stringify(requestBody),
        headers: {
          "Content-Type": "application/json",
        },
      });

      const updatedUser = await res.json();

      if (res.status === 200) {
        toast.success("Profile updated successfully");
        setLoading(false);
        return updatedUser;
      } else if (res.status === 401) {
        setLoading(false);
        toast.error("Can't update demo user");
      } else {
        setLoading(false);
        toast.error("Failed to update profile");
      }
    } catch (error: any) {
      setLoading(false);
      toast.error(error?.response?.data);
    }

    return null;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (isDemo) {
      toast.error("Can't update demo user");
      setData({
        name: "",
        email: "",
        profilePhoto: "",
        coverPhoto: "",
      });
      return null;
    }

    const uploadedImageUrl = await handleFileUpload(file);
    const uploadedCoverImageUrl = await handleFileUpload(file);
    setLoading(true);

    const updatedUser = await updateUserProfile(
      data,
      uploadedImageUrl as string,
      uploadedCoverImageUrl as string,
    );

    if (updatedUser) {
      await update({
        ...session,
        user: {
          ...session?.user,
          name: updatedUser.name,
          email: updatedUser.email,
          image: updatedUser.image,
          coverImage: updatedUser.coverImage,
        },
      });

      setData({
        name: "",
        email: "",
        profilePhoto: "",
        coverPhoto: "",
      });
      window.location.reload();
    }
  };
  return (
    <div className="mx-auto w-full max-w-[970px]">
      <Breadcrumb pageName="Profile" />

      <div className="overflow-hidden rounded-[10px] bg-white shadow-1 dark:bg-gray-dark dark:shadow-card">
        <div className="relative z-20 h-35 md:h-65">
          <Image
            src={data?.coverPhoto}
            alt="profile cover"
            className="h-full w-full rounded-tl-[10px] rounded-tr-[10px] object-cover object-center"
            width={970}
            height={260}
            style={{
              width: "auto",
              height: "auto",
            }}
          />
          <div className="absolute bottom-1 right-1 z-10 xsm:bottom-4 xsm:right-4">
            <label
              htmlFor="cover"
              className="flex cursor-pointer items-center justify-center gap-2 rounded-lg bg-primary px-[15px] py-[5px] text-body-sm font-medium text-white hover:bg-opacity-90"
            >
              <input
                type="file"
                name="coverPhoto"
                id="coverPhoto"
                className="sr-only"
                onChange={handleChange}
                accept="image/png, image/jpg, image/jpeg"
              />

              <CameraIcon />

              <span>Edit</span>
            </label>
          </div>
        </div>
        <div className="px-4 pb-6 text-center lg:pb-8 xl:pb-11.5">
          <div className="relative z-30 mx-auto -mt-22 h-30 w-full max-w-30 rounded-full bg-white/20 p-1 backdrop-blur sm:h-44 sm:max-w-[176px] sm:p-3">
            <div className="relative drop-shadow-2">
              {data?.profilePhoto && (
                <>
                  <Image
                    src={data?.profilePhoto}
                    width={160}
                    height={160}
                    className="overflow-hidden rounded-full"
                    alt="profile"
                  />

                  <label
                    htmlFor="profilePhoto"
                    className="absolute bottom-0 right-0 flex size-8.5 cursor-pointer items-center justify-center rounded-full bg-primary text-white hover:bg-opacity-90 sm:bottom-2 sm:right-2"
                  >
                    <CameraIcon />

                    <input
                      type="file"
                      name="profilePhoto"
                      id="profilePhoto"
                      className="sr-only"
                      onChange={handleChange}
                      accept="image/png, image/jpg, image/jpeg"
                    />
                  </label>
                </>
              )}
            </div>
          </div>
          <div className="mt-4">
            <h3 className="mb-1 text-heading-6 font-bold text-dark dark:text-white">
              {data?.name}
            </h3>
            <p className="font-medium">Ui/Ux Designer</p>
            <div className="mx-auto mb-5.5 mt-5 grid max-w-[370px] grid-cols-3 rounded-[5px] border border-stroke py-[9px] shadow-1 dark:border-dark-3 dark:bg-dark-2 dark:shadow-card">
              <div className="flex flex-col items-center justify-center gap-1 border-r border-stroke px-4 dark:border-dark-3 xsm:flex-row">
                <span className="font-medium text-dark dark:text-white">
                  259
                </span>
                <span className="text-body-sm">Posts</span>
              </div>
              <div className="flex flex-col items-center justify-center gap-1 border-r border-stroke px-4 dark:border-dark-3 xsm:flex-row">
                <span className="font-medium text-dark dark:text-white">
                  129K
                </span>
                <span className="text-body-sm">Followers</span>
              </div>
              <div className="flex flex-col items-center justify-center gap-1 px-4 xsm:flex-row">
                <span className="font-medium text-dark dark:text-white">
                  2K
                </span>
                <span className="text-body-sm-sm">Following</span>
              </div>
            </div>

            <div className="mx-auto max-w-[720px]">
              <h4 className="font-medium text-dark dark:text-white">
                About Me
              </h4>
              <p className="mt-4">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                Pellentesque posuere fermentum urna, eu condimentum mauris
                tempus ut. Donec fermentum blandit aliquet. Etiam dictum dapibus
                ultricies. Sed vel aliquet libero. Nunc a augue fermentum,
                pharetra ligula sed, aliquam lacus.
              </p>
            </div>

            <SocialAccounts />
          </div>
        </div>
      </div>
    </div>
  );
}
