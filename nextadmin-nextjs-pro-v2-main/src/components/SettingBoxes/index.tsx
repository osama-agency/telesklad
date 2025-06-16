"use client";
import { getSignedURL } from "@/actions/upload";
import {
  CallIcon,
  EmailIcon,
  PencilSquareIcon,
  UploadIcon,
  UserIcon,
} from "@/assets/icons";
import { useSession } from "next-auth/react";
import Image from "next/image";
import React, { useState } from "react";
import toast from "react-hot-toast";

const SettingBoxes = () => {
  const { data: session, update } = useSession();

  const profilePic = session?.user?.image
    ? session?.user?.image.includes("http")
      ? session?.user?.image
      : `${process.env.NEXT_PUBLIC_IMAGE_URL}/${session?.user?.image}`
    : "/images/user/user-03.png";

  const [data, setData] = useState({
    name: session?.user.name as string,
    email: "",
    phone: "",
    bio: "",
    profilePhoto: profilePic,
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

  const updateUserProfile = async (data: any, uploadedImageUrl: string) => {
    try {
      const requestBody = {
        name: data.name,
        email: data.email,
        image: "",
        phone: data.phone,
        bio: data.bio,
      };

      if (uploadedImageUrl) {
        requestBody.image = uploadedImageUrl;
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
        phone: "",
        bio: "",
      });
      return null;
    }

    const uploadedImageUrl = await handleFileUpload(file);
    setLoading(true);

    const updatedUser = await updateUserProfile(
      data,
      uploadedImageUrl as string,
    );

    if (updatedUser) {
      await update({
        ...session,
        user: {
          ...session?.user,
          name: updatedUser.name,
          email: updatedUser.email,
          image: updatedUser.image,
          phone: updatedUser.phone,
          bio: updatedUser.bio,
        },
      });

      setData({
        name: "",
        email: "",
        profilePhoto: "",
        phone: "",
        bio: "",
      });
      window.location.reload();
    }
  };

  return (
    <>
      <div className="grid grid-cols-5 gap-8">
        <div className="col-span-5 xl:col-span-3">
          <div className="rounded-[10px] border border-stroke bg-white shadow-1 dark:border-dark-3 dark:bg-gray-dark dark:shadow-card">
            <div className="border-b border-stroke px-7 py-4 dark:border-dark-3">
              <h3 className="font-medium text-dark dark:text-white">
                Personal Information
              </h3>
            </div>
            <div className="p-7">
              <form onSubmit={handleSubmit}>
                <div className="mb-5.5 flex flex-col gap-5.5 sm:flex-row">
                  <div className="w-full sm:w-1/2">
                    <label
                      className="mb-3 block text-body-sm font-medium text-dark dark:text-white"
                      htmlFor="fullName"
                    >
                      Full Name
                    </label>
                    <div className="relative">
                      <span className="absolute left-4.5 top-1/2 -translate-y-1/2">
                        <UserIcon />
                      </span>
                      <input
                        className="w-full rounded-lg border-[1.5px] border-stroke bg-white py-2.5 pl-12.5 pr-4.5 text-dark focus:border-primary focus-visible:outline-none dark:border-dark-3 dark:bg-dark-2 dark:text-white dark:focus:border-primary"
                        type="text"
                        name="fullName"
                        id="fullName"
                        placeholder="Devid Jhon"
                        defaultValue={data.name}
                        onChange={(e) => handleChange?.(e)}
                      />
                    </div>
                  </div>

                  <div className="w-full sm:w-1/2">
                    <label
                      className="mb-3 block text-body-sm font-medium text-dark dark:text-white"
                      htmlFor="phoneNumber"
                    >
                      Phone Number
                    </label>
                    <div className="relative">
                      <span className="absolute left-4.5 top-1/2 -translate-y-1/2">
                        <CallIcon />
                      </span>

                      <input
                        className="w-full rounded-lg border-[1.5px] border-stroke bg-white py-2.5 pl-12.5 pr-4.5 text-dark focus:border-primary focus-visible:outline-none dark:border-dark-3 dark:bg-dark-2 dark:text-white dark:focus:border-primary"
                        type="text"
                        name="phoneNumber"
                        id="phoneNumber"
                        placeholder="+990 3343 7865"
                        defaultValue={data.phone}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                </div>

                <div className="mb-5.5">
                  <label
                    className="mb-3 block text-body-sm font-medium text-dark dark:text-white"
                    htmlFor="emailAddress"
                  >
                    Email Address
                  </label>
                  <div className="relative">
                    <span className="absolute left-4.5 top-1/2 -translate-y-1/2">
                      <EmailIcon />
                    </span>
                    <input
                      className="w-full rounded-lg border-[1.5px] border-stroke bg-white py-2.5 pl-12.5 pr-4.5 text-dark focus:border-primary focus-visible:outline-none dark:border-dark-3 dark:bg-dark-2 dark:text-white dark:focus:border-primary"
                      type="email"
                      name="emailAddress"
                      id="emailAddress"
                      placeholder="devidjond45@gmail.com"
                      defaultValue={data.email}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="mb-5.5">
                  <label
                    className="mb-3 block text-body-sm font-medium text-dark dark:text-white"
                    htmlFor="Username"
                  >
                    Username
                  </label>
                  <div className="relative">
                    <span className="absolute left-4.5 top-1/2 -translate-y-1/2">
                      <UserIcon />
                    </span>
                    <input
                      className="w-full rounded-lg border-[1.5px] border-stroke bg-white py-2.5 pl-12.5 pr-4.5 text-dark focus:border-primary focus-visible:outline-none dark:border-dark-3 dark:bg-dark-2 dark:text-white dark:focus:border-primary"
                      type="text"
                      name="Username"
                      id="Username"
                      placeholder="devidjhon24"
                      defaultValue={data.name}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="mb-5.5">
                  <label
                    className="mb-3 block text-body-sm font-medium text-dark dark:text-white"
                    htmlFor="bio"
                  >
                    BIO
                  </label>
                  <div className="relative">
                    <span className="absolute left-5 top-5.5">
                      <PencilSquareIcon width={20} height={20} />
                    </span>

                    <textarea
                      className="w-full rounded-lg border-[1.5px] border-stroke bg-white py-5 pl-13 pr-5 text-dark focus:border-primary focus-visible:outline-none dark:border-dark-3 dark:bg-dark-2 dark:text-white dark:focus:border-primary"
                      name="bio"
                      id="bio"
                      rows={6}
                      placeholder="Write your bio here"
                      defaultValue={data.bio}
                      onChange={handleChange}
                    ></textarea>
                  </div>
                </div>

                <div className="flex justify-end gap-3">
                  <button
                    className="flex justify-center rounded-lg border border-stroke px-6 py-[7px] font-medium text-dark hover:shadow-1 dark:border-dark-3 dark:text-white"
                    type="submit"
                  >
                    Cancel
                  </button>
                  <button
                    className="flex justify-center rounded-lg bg-primary px-6 py-[7px] font-medium text-gray-2 hover:bg-opacity-90"
                    type="submit"
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        Saving{" "}
                        <span
                          className={`h-4 w-4 animate-spin rounded-full border-2 border-solid border-white border-t-transparent dark:border-dark dark:border-t-transparent`}
                        ></span>
                      </span>
                    ) : (
                      "Save"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
        <div className="col-span-5 xl:col-span-2">
          <div className="rounded-[10px] border border-stroke bg-white shadow-1 dark:border-dark-3 dark:bg-gray-dark dark:shadow-card">
            <div className="border-b border-stroke px-7 py-4 dark:border-dark-3">
              <h3 className="font-medium text-dark dark:text-white">
                Your Photo
              </h3>
            </div>
            <div className="p-7">
              <form onSubmit={handleSubmit}>
                <div className="mb-4 flex items-center gap-3">
                  <Image
                    src={data.profilePhoto}
                    width={55}
                    height={55}
                    alt="User"
                    className="size-14 rounded-full object-cover"
                    quality={90}
                  />

                  <div>
                    <span className="mb-1.5 font-medium text-dark dark:text-white">
                      Edit your photo
                    </span>
                    <span className="flex gap-3">
                      <button
                        type="button"
                        className="text-body-sm hover:text-red"
                      >
                        Delete
                      </button>
                      <button className="text-body-sm hover:text-primary">
                        Update
                      </button>
                    </span>
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
                    onChange={handleChange}
                    accept="image/png, image/jpg, image/jpeg"
                    className="absolute inset-0 z-50 m-0 h-full w-full cursor-pointer p-0 opacity-0 outline-none"
                  />
                  <div className="flex flex-col items-center justify-center">
                    <div className="flex h-13.5 w-13.5 items-center justify-center rounded-full border border-stroke bg-white dark:border-dark-3 dark:bg-gray-dark">
                      <UploadIcon />
                    </div>
                    <p className="mt-2.5 text-body-sm font-medium">
                      <span className="text-primary">Click to upload</span> or
                      drag and drop
                    </p>
                    <p className="mt-1 text-body-xs">
                      SVG, PNG, JPG or GIF (max, 800 X 800px)
                    </p>
                  </div>
                </div>

                <div className="flex justify-end gap-3">
                  <button
                    className="flex justify-center rounded-lg border border-stroke px-6 py-[7px] font-medium text-dark hover:shadow-1 dark:border-dark-3 dark:text-white"
                    type="button"
                  >
                    Cancel
                  </button>
                  <button
                    className="flex items-center justify-center rounded-lg bg-primary px-6 py-[7px] font-medium text-gray-2 hover:bg-opacity-90"
                    type="submit"
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        Saving{" "}
                        <span className="inline-block size-4 animate-spin rounded-full border-2 border-solid border-white border-t-transparent dark:border-dark dark:border-t-transparent" />
                      </span>
                    ) : (
                      "Save"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SettingBoxes;
