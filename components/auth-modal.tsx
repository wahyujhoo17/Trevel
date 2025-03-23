import { auth, googleProvider, twitterProvider } from "@/lib/firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  setPersistence,
  browserLocalPersistence,
} from "firebase/auth";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { FcGoogle } from "react-icons/fc";
import { BsApple, BsTwitterX } from "react-icons/bs";
import { toast } from "sonner";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  });

  // Helper to handle and format Firebase auth errors
  const handleAuthError = (error: any) => {
    console.error("Auth error:", error);

    // Menangani berbagai kode error Firebase
    switch (error.code) {
      case "auth/invalid-email":
        return "Invalid email address format.";
      case "auth/user-disabled":
        return "This account has been disabled.";
      case "auth/user-not-found":
        return "No account found with this email.";
      case "auth/wrong-password":
        return "Incorrect password.";
      case "auth/email-already-in-use":
        return "This email is already registered.";
      case "auth/weak-password":
        return "Password should be at least 6 characters.";
      case "auth/popup-closed-by-user":
        return "Sign in was cancelled.";
      case "auth/popup-blocked":
        return "Popup was blocked by your browser. Please allow popups for this site.";
      case "auth/network-request-failed":
        return "Network error. Please check your connection.";
      case "auth/too-many-requests":
        return "Too many unsuccessful attempts. Please try again later.";
      default:
        return error.message || "An error occurred during authentication.";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      // Set persistence first - this ensures the user stays logged in
      await setPersistence(auth, browserLocalPersistence);

      if (isLogin) {
        // Login
        await signInWithEmailAndPassword(
          auth,
          formData.email,
          formData.password
        );
        toast.success("Signed in successfully!");
      } else {
        // Register
        if (formData.password !== formData.confirmPassword) {
          throw new Error("Passwords do not match");
        }

        if (formData.password.length < 6) {
          throw new Error("Password should be at least 6 characters");
        }

        await createUserWithEmailAndPassword(
          auth,
          formData.email,
          formData.password
        );
        toast.success("Account created successfully!");
      }

      // Reset form
      setFormData({
        email: "",
        password: "",
        confirmPassword: "",
      });

      onClose();
    } catch (error: any) {
      const errorMessage = handleAuthError(error);
      setError(errorMessage);
      toast.error(isLogin ? "Sign in failed" : "Registration failed", {
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = async (
    provider: "google" | "apple" | "twitter"
  ) => {
    setIsLoading(true);
    setError(null);

    try {
      // Set persistence first for social logins too
      await setPersistence(auth, browserLocalPersistence);

      if (provider === "google") {
        const result = await signInWithPopup(auth, googleProvider);
        if (result) {
          toast.success("Successfully signed in with Google!");
          onClose();
        }
      } else if (provider === "twitter") {
        const result = await signInWithPopup(auth, twitterProvider);
        if (result) {
          toast.success("Successfully signed in with Twitter!");
          onClose();
        }
      } else if (provider === "apple") {
        toast.info("Apple sign in coming soon");
      }
    } catch (error: any) {
      const errorMessage = handleAuthError(error);
      setError(errorMessage);
      toast.error("Social sign in failed", {
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Validasi email dengan regex
  const isEmailValid = (email: string) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  // Validasi form sebelum submit
  const isFormValid = () => {
    if (!isEmailValid(formData.email)) {
      return false;
    }

    if (formData.password.length < 6) {
      return false;
    }

    if (!isLogin && formData.password !== formData.confirmPassword) {
      return false;
    }

    return true;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">
            {isLogin ? "Welcome Back" : "Create Account"}
          </DialogTitle>
        </DialogHeader>

        {error && (
          <div
            className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md text-sm"
            role="alert"
          >
            <span className="block">{error}</span>
          </div>
        )}

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-3 gap-3">
            <Button
              variant="outline"
              onClick={() => handleSocialLogin("google")}
              disabled={isLoading}
              className="w-full relative"
              type="button"
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <FcGoogle className="h-5 w-5" />
              )}
            </Button>
            <Button
              variant="outline"
              onClick={() => handleSocialLogin("twitter")}
              disabled={isLoading}
              className="w-full relative"
              type="button"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <BsTwitterX className="h-4 w-4" />
              )}
            </Button>
            <Button
              variant="outline"
              onClick={() => handleSocialLogin("apple")}
              disabled={isLoading}
              className="w-full relative"
              type="button"
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <BsApple className="h-5 w-5" />
              )}
            </Button>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or continue with
              </span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                required
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className={
                  formData.email && !isEmailValid(formData.email)
                    ? "border-red-500 focus:ring-red-500"
                    : ""
                }
              />
              {formData.email && !isEmailValid(formData.email) && (
                <p className="text-red-500 text-xs mt-1">
                  Please enter a valid email address
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                required
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                className={
                  formData.password && formData.password.length < 6
                    ? "border-red-500 focus:ring-red-500"
                    : ""
                }
              />
              {formData.password && formData.password.length < 6 && (
                <p className="text-red-500 text-xs mt-1">
                  Password must be at least 6 characters
                </p>
              )}
            </div>

            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirm your password"
                  required
                  value={formData.confirmPassword}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      confirmPassword: e.target.value,
                    })
                  }
                  className={
                    formData.confirmPassword &&
                    formData.password !== formData.confirmPassword
                      ? "border-red-500 focus:ring-red-500"
                      : ""
                  }
                />
                {formData.confirmPassword &&
                  formData.password !== formData.confirmPassword && (
                    <p className="text-red-500 text-xs mt-1">
                      Passwords do not match
                    </p>
                  )}
              </div>
            )}

            <Button
              className="w-full h-11"
              type="submit"
              disabled={isLoading || !isFormValid()}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isLogin ? "Signing in..." : "Creating account..."}
                </>
              ) : isLogin ? (
                "Sign In"
              ) : (
                "Create Account"
              )}
            </Button>

            {isLogin && (
              <div className="text-center">
                <Button
                  type="button"
                  variant="link"
                  size="sm"
                  className="text-xs text-gray-500 h-auto p-0"
                  onClick={() => {
                    if (!formData.email) {
                      setError("Please enter your email to reset password");
                      return;
                    }
                    if (!isEmailValid(formData.email)) {
                      setError("Please enter a valid email address");
                      return;
                    }
                    // Implement password reset logic here
                    toast.info("Password reset feature coming soon");
                  }}
                >
                  Forgot your password?
                </Button>
              </div>
            )}

            <div className="text-center space-y-2">
              <p className="text-sm text-gray-500">
                {isLogin
                  ? "Don't have an account?"
                  : "Already have an account?"}
              </p>
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => {
                  setIsLogin(!isLogin);
                  setError(null);
                  setFormData({
                    email: formData.email, // Keep email for convenience
                    password: "",
                    confirmPassword: "",
                  });
                }}
              >
                {isLogin ? "Create Account" : "Sign In"}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
