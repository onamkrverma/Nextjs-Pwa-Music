"use client";
import BackButton from "@/components/BackButton";
import Input from "@/components/Input";
import Loading from "@/components/Loading";
import GoogleIcon from "@/public/icons/google.svg";
import Link from "next/link";
import { use, useState } from "react";
import { gooogleLoginAction, loginAction } from "../actions/auth";

type Props = {
  searchParams: Promise<{ [key: string]: string | undefined }>;
};

const Login = ({ searchParams }: Props) => {
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const searchParamsRes = use(searchParams);
  const redirectNext = searchParamsRes["next"];

  const removeSwAndRedirect = async () => {
    if ("serviceWorker" in navigator) {
      const sw = await navigator.serviceWorker.getRegistration("/sw.js");
      await sw?.unregister();
    }
    window.location.href = redirectNext
      ? `${window.location.origin}/${redirectNext}`
      : "/";
  };

  const handleLogin = async (formData: FormData) => {
    setIsLoading(true);
    const email = formData.get("email")?.toString();
    const password = formData.get("password")?.toString();
    setErrorMessage("");
    if (!email || !password) {
      return setErrorMessage("Please provide all fields");
    }
    const res = await loginAction(email, password);
    setIsLoading(false);
    if (res?.error) {
      return setErrorMessage(res.error);
    }
    await removeSwAndRedirect();
  };

  const handleGoogleLogin = async () => {
    await gooogleLoginAction(redirectNext);
    await removeSwAndRedirect();
  };

  return (
    <div className="flex justify-center items-center h-screen w-full p-4 ">
      <div className="absolute top-4 left-4">
        <BackButton />
      </div>

      <div className="bg-primary/50 flex flex-col gap-4 items-center p-5 rounded-xl border shadow-neutral-500 shadow-md w-full max-w-md">
        <img src="/logo-full.svg" alt="okv tunes" className="h-12" />
        <p>Sign in and enjoy unlimited free music!</p>
        <form action={handleGoogleLogin}>
          <button
            type="submit"
            className="flex items-center justify-center gap-2 border bg-primary hover:bg-secondary rounded-xl p-2 px-4"
          >
            <GoogleIcon className="w-6 h-6" /> Signin with Google
          </button>
        </form>

        <div className="w-full flex justify-center items-center relative border-t my-2 ">
          <span className="px-2 bg-[#130f10] absolute -top-3">OR</span>
        </div>

        <form
          className="flex flex-col gap-2 items-center w-full"
          action={handleLogin}
        >
          <Input
            name="email"
            type="email"
            label="Email"
            autoComplete="email"
            placeholder="example@gmail.com"
            required
          />

          <Input
            name="password"
            type="password"
            label="Password"
            autoComplete="current-password"
            required
            minLength={8}
            placeholder="Your password"
          />

          <button
            type="submit"
            title="login"
            className="bg-neutral-800 w-full mt-2 text-primary rounded-lg p-3 border hover:bg-action"
          >
            {isLoading ? <Loading width="6" height="6" /> : "Login"}
          </button>
          {errorMessage ? (
            <p className="text-action text-sm my-2 bg-neutral-50 p-1 px-4 rounded-md text-center">
              {errorMessage}
            </p>
          ) : null}
        </form>
        <p>
          {`Don't have an account?`}
          <Link
            href="/signup"
            className="text-action-600 hover:underline underline-offset-2 ml-1"
          >
            Signup
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
