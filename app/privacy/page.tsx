import BackButton from "@/components/BackButton";
import { Metadata } from "next";
import Link from "next/link";
import React from "react";

export const metadata: Metadata = {
  title: "Privacy Policy • Okv-Tunes",
};
export const dynamic = "force-static";
export const revalidate = false;

const Privacy = () => {
  return (
    <div className="inner-container p-6">
      <BackButton />
      <h1 className="text-3xl font-bold my-4">Privacy Policy</h1>
      <p className="mb-4">
        Your privacy is important to us. This privacy policy explains how we
        collect, use, and protect your information.
      </p>

      <h2 className="text-2xl font-semibold mb-2">1. Information We Collect</h2>
      <p className="mb-4">
        We collect the following information from you when you use our service:
      </p>
      <ul className="list-disc list-inside mb-4">
        <li>Username</li>
        <li>Email address</li>
        <li>Profile image</li>
        <li>Liked songs data</li>
      </ul>

      <h2 className="text-2xl font-semibold mb-2">
        2. How We Use Your Information
      </h2>
      <p className="mb-4">
        We use your information to provide and improve our service, personalize
        your experience, and communicate with you.
      </p>

      <h2 className="text-2xl font-semibold mb-2">
        3. Sharing Your Information
      </h2>
      <p className="mb-4">
        We do not share your personal information with third parties except as
        necessary to provide our service or as required by law.
      </p>

      <h2 className="text-2xl font-semibold mb-2">4. Security</h2>
      <p className="mb-4">
        We take reasonable measures to protect your information from
        unauthorized access, use, or disclosure.
      </p>

      <h2 className="text-2xl font-semibold mb-2">5. Changes to This Policy</h2>
      <p className="mb-4">
        We may update this privacy policy from time to time. We will notify you
        of any changes by posting the new policy on our website.
      </p>

      <h2 className="text-2xl font-semibold mb-2">6. Contact Us</h2>
      <p>
        If you have any questions about this Privacy Policy, please visit our
        <Link href={"/contact"} className="underline mx-2">
          contact us
        </Link>
        page and submit your query.
      </p>
    </div>
  );
};

export default Privacy;
