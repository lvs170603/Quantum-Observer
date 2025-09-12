
'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export default function SessionsPage() {
  const router = useRouter();

  return (
    <div className="flex min-h-screen w-full flex-col bg-background text-foreground p-4 sm:p-6">
       <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60 sm:h-16 sm:px-6">
        <Button variant="outline" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Go Back</span>
        </Button>
        <h1 className="text-lg font-semibold md:text-xl">Active Sessions</h1>
      </header>
       <main className="flex flex-1 flex-col gap-4 p-4 sm:p-6">
        <Card>
            <CardHeader>
                <CardTitle>Session Details</CardTitle>
            </CardHeader>
            <CardContent>
                <p>A list of active user sessions will be displayed here.</p>
            </CardContent>
        </Card>
      </main>
    </div>
  );
}
