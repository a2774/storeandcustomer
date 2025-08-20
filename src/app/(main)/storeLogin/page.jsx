"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import LoadingSpinner from "@/components/LoadingSpinner";


const StoreLoginRedirect = () => {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the new landing page (root)
    router.replace('/');
  }, [router]);

  return <LoadingSpinner size="lg" text="Redirecting..." fullScreen={true} />;
};

export default StoreLoginRedirect;
