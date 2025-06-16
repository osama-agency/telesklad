"use client";
import { PasswordIcon } from "@/assets/icons";
import InputGroup from "@/components/FormElements/InputGroup";
import axios from "axios";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";

export default function ResetPassword({ token }: { token: string }) {
  const [data, setData] = useState({
    newPassword: "",
    ReNewPassword: "",
  });

  const [user, setUser] = useState({
    email: "",
  });

  const router = useRouter();

  useEffect(() => {
    const verifyToken = async () => {
      try {
        const res = await axios.post(`/api/forgot-password/verify-token`, {
          token,
        });

        if (res.status === 200) {
          setUser({
            email: res.data.email,
          });
        }
      } catch (error: any) {
        toast.error(error.response.data);
        router.push("/auth/forgot-password");
      }
    };

    verifyToken();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setData({
      ...data,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (data.newPassword === "") {
      toast.error("Please enter your password.");
      return;
    }

    try {
      const res = await axios.post(`/api/forgot-password/update`, {
        email: user?.email,
        password: data.newPassword,
      });

      if (res.status === 200) {
        toast.success(res.data);
        setData({ newPassword: "", ReNewPassword: "" });
        router.push("/auth/signin");
      }
    } catch (error: any) {
      toast.error(error.response.data);
    }
  };

  return (
    <>
      <div className="mb-7.5 text-center">
        <h3 className="font-satoshi mb-4 text-heading-5 font-bold text-dark dark:text-white">
          Create New Password
        </h3>
        <p>Create new password to save your account</p>
      </div>

      <form onSubmit={handleSubmit}>
        <InputGroup
          type="password"
          label="New Password"
          className="mb-5 [&_input]:py-[15px]"
          placeholder="Enter your new password"
          name="newPassword"
          handleChange={handleChange}
          value={data.newPassword}
          icon={<PasswordIcon />}
        />

        <InputGroup
          type="password"
          label="Re-type new password"
          className="mb-6 [&_input]:py-[15px]"
          placeholder="Re-enter your new password"
          name="ReNewPassword"
          handleChange={handleChange}
          value={data.ReNewPassword}
          icon={<PasswordIcon />}
        />

        <div className="mb-5">
          <button
            type="submit"
            className="w-full cursor-pointer rounded-lg bg-primary p-4 font-medium text-white transition hover:bg-opacity-90"
          >
            Create Password
          </button>
        </div>

        <div className="mt-4.5 text-center font-medium">
          <p>
            Already have an account?{" "}
            <Link href="/auth/signin" className="text-primary">
              Sign in
            </Link>
          </p>
        </div>
      </form>
    </>
  );
}
