import { EmailIcon, PasswordIcon, UserIcon } from "@/assets/icons";
import axios from "axios";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import toast from "react-hot-toast";
import InputGroup from "../FormElements/InputGroup";

const SignupWithPassword = () => {
  const [data, setData] = useState({
    name: "",
    email: "",
    password: "",
    reEnterPassword: "",
  });

  const [loading, setLoading] = useState(false);
  const { name, email, password, reEnterPassword } = data;

  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setData({
      ...data,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!name.trim() || !email || !password || !reEnterPassword) {
      return toast.error("Please fill in all fields!");
    }

    setLoading(true);

    try {
      const res = await axios.post("/api/user/register", {
        name,
        email,
        password,
        reEnterPassword,
      });

      if (res.status === 200) {
        toast.success("User has been registered");
        setData({
          name: "",
          email: "",
          password: "",
          reEnterPassword: "",
        });
        setLoading(false);
        signIn("credentials", { ...data, redirect: false }).then((callback) => {
          if (callback?.error) {
            toast.error(callback.error);
            setLoading(false);
          }

          if (callback?.ok && !callback?.error) {
            setLoading(false);
            router.push("/");
          }
        });
      } else {
        toast.error(res.data);
        setLoading(false);
      }
    } catch (error: any) {
      toast.error(error.response.data);
      setLoading(false);
      return;
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <InputGroup
        type="text"
        label="Name"
        className="mb-4 [&_input]:py-[15px]"
        placeholder="Enter your full name"
        name="name"
        handleChange={handleChange}
        value={data.name}
        icon={<UserIcon />}
      />

      <InputGroup
        type="email"
        label="Email"
        className="mb-4 [&_input]:py-[15px]"
        placeholder="Enter your email"
        name="email"
        handleChange={handleChange}
        value={data.email}
        icon={<EmailIcon />}
      />

      <InputGroup
        type="password"
        label="Password"
        className="mb-4 [&_input]:py-[15px]"
        placeholder="Enter your password"
        name="password"
        handleChange={handleChange}
        value={data.password}
        icon={<PasswordIcon />}
      />

      <InputGroup
        type="password"
        label="Re-type Password"
        className="mb-6 [&_input]:py-[15px]"
        placeholder="Re-enter your password"
        name="reEnterPassword"
        handleChange={handleChange}
        value={data.reEnterPassword}
        icon={<PasswordIcon />}
      />

      <button
        type="submit"
        className="mb-5 flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-primary p-4 font-medium text-white transition hover:bg-opacity-90"
      >
        Create account
        {loading && (
          <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-white border-t-transparent dark:border-dark dark:border-t-transparent" />
        )}
      </button>
    </form>
  );
};

export default SignupWithPassword;
