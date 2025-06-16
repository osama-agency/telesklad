"use client";
import { EmailIcon } from "@/assets/icons";
import InputGroup from "@/components/FormElements/InputGroup";
import validateEmail from "@/libs/validateEmail";
import axios from "axios";
import Link from "next/link";
import React, { useState } from "react";
import { toast } from "react-hot-toast";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!email) {
      toast.error("Please enter your email address.");

      return;
    }

    if (!validateEmail(email)) {
      toast.error("Please enter a valid email address.");
      return;
    }

    try {
      setLoading(true);
      const res = await axios.post("/api/forgot-password/reset", {
        email,
      });

      if (res.status === 404) {
        toast.error("User not found.");
        setEmail("");
        setLoading(false);
        return;
      }

      if (res.status === 200) {
        toast.success(res.data);
        setLoading(false);
        setEmail("");
      }

      setEmail("");
    } catch (error: any) {
      setLoading(false);
      toast.error(error.response.data);
    }
  };
  return (
    <>
      <form onSubmit={handleSubmit}>
        <InputGroup
          type="email"
          label="Email"
          placeholder="Enter your email"
          className="mb-6"
          name="email"
          value={email}
          handleChange={handleChange}
          icon={<EmailIcon />}
        />

        <div className="mb-4.5">
          <button
            type="submit"
            className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-primary p-4 font-medium text-white transition hover:bg-opacity-90"
          >
            {loading ? (
              <>
                Sending
                <span
                  className={`inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-white border-t-transparent dark:border-dark dark:border-t-transparent`}
                ></span>
              </>
            ) : (
              "Send Password Reset Link"
            )}
          </button>
        </div>

        <div className="text-center font-medium">
          <p>
            Login to your account from{" "}
            <Link href="/auth/signin" className="text-primary underline">
              here
            </Link>
          </p>
        </div>
      </form>
    </>
  );
}
