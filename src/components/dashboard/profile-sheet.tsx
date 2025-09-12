
"use client"

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { User, Mail, Building, Calendar } from "lucide-react"

interface ProfileSheetProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

export function ProfileSheet({ isOpen, onOpenChange }: ProfileSheetProps) {

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>User Profile</SheetTitle>
          <SheetDescription>
            Your account details and preferences.
          </SheetDescription>
        </SheetHeader>
        <div className="space-y-4 py-4">
            <div className="flex flex-col items-center space-y-4">
                 <Avatar className="h-24 w-24">
                    <AvatarImage src="https://picsum.photos/seed/user/128/128" data-ai-hint="profile avatar" />
                    <AvatarFallback>
                        <User className="h-12 w-12" />
                    </AvatarFallback>
                </Avatar>
                <div className="text-center">
                    <h2 className="text-2xl font-semibold">Alex Doe</h2>
                    <p className="text-muted-foreground">Quantum Researcher</p>
                </div>
            </div>

            <Separator />
            
            <div className="grid gap-2 text-sm">
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">alex.doe@example.com</span>
              </div>
               <div className="flex items-center gap-3">
                <Building className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Quantum Innovations Inc.</span>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Member since: Jan 2023</span>
              </div>
            </div>
            
            <Separator />

             <div>
              <h4 className="mb-2 text-sm font-semibold">Recent Activity</h4>
                <ul className="space-y-2 text-xs text-muted-foreground">
                    <li>- Submitted job c1a2b3d4e5f6 on ibm_brisbane</li>
                    <li>- Analyzed anomalies in the last 24 hours</li>
                    <li>- Updated backend filter to ibm_kyoto</li>
                </ul>
            </div>
          </div>
      </SheetContent>
    </Sheet>
  )
}
