import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AuthForm } from "@/components/forms/auth-form";

export const metadata = { title: "Create an account" };

export default function RegisterPage() {
  return (
    <div className="container flex items-center justify-center py-12 sm:py-20">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="font-serif text-3xl font-normal">Create your account</CardTitle>
          <CardDescription>You&apos;ll set up your household next.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <AuthForm mode="register" />
          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="font-medium text-foreground hover:underline">
              Sign in
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
