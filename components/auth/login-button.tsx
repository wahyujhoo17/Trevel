import { signInWithPopup, signInWithRedirect } from "firebase/auth";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { auth, googleProvider } from "@/lib/firebase";
import { toast } from "sonner";

export function LoginButton() {
  const handleLogin = async () => {
    try {
      // Check if running on mobile
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

      if (isMobile) {
        // Use redirect for mobile devices
        await signInWithRedirect(auth, googleProvider);
      } else {
        // Use popup for desktop
        await signInWithPopup(auth, googleProvider);
      }
    } catch (error: any) {
      console.error("Login error:", error);
      toast.error(error.message || "Failed to login");
    }
  };

  return (
    <Button onClick={handleLogin}>
      <Image src="/google.svg" alt="Google" width={20} height={20} />
      <span className="ml-2">Continue with Google</span>
    </Button>
  );
}
