"use client"

import { signIn } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useActionState } from "react";

async function signInAction(prevState: {error: string}  | null, formData:FormData) {
    return await signIn(prevState, formData)
}

export default function Login() {
    const[state, formAction] = useActionState(signInAction, null)
  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <form action={formAction} className="p-8 bg-white rounded-lg shadow-md w-96">
        <h1 className="text-2xl font-bold mb-6 text-center">Admin Login</h1>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="Email" placeholder="Email" required />
          </div>

           <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" name="password" type="password" placeholder="Password" required />
          </div>
          <Button type="submit" className="w-full cursor-pointer">Log In</Button>

          {/* Error states  */}
          {state?.error && (
              <p className="text-red-500 text-center text-sm">{state.error}</p>
          )}
        </div>
      </form>
    </div>
  );
}
