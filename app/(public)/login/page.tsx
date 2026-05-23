import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AuthForm } from "@/components/forms/auth-form";

export const metadata = { title: "Sign in" };

export default function LoginPage() {
  return (
    <div className="container flex items-center justify-center py-12 sm:py-20">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="font-serif text-3xl font-normal">Welcome back</CardTitle>
          <CardDescription>Sign in to your household.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <AuthForm mode="login" />
          <p className="text-center text-sm text-muted-foreground">
            New here?{" "}
            <Link href="/register" className="font-medium text-foreground hover:underline">
              Create an account
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
