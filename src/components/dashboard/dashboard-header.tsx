
"use client"

import { BrainCircuit, RefreshCw, SlidersHorizontal, User } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { ThemeToggle } from "@/components/dashboard/theme-toggle"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useRouter } from "next/navigation"


type DashboardHeaderProps = {
  isDemo: boolean;
  onToggleDemo: (checked: boolean) => void;
  autoRefresh: boolean;
  onToggleRefresh: (checked: boolean) => void;
  lastUpdated: Date | null;
  onAnalyze: () => void;
  onOpenFilters: () => void;
  isFetching: boolean;
  onRefresh: () => void;
  onOpenProfile: () => void;
};

export function DashboardHeader({
  isDemo,
  onToggleDemo,
  autoRefresh,
  onToggleRefresh,
  lastUpdated,
  onAnalyze,
  onOpenFilters,
  isFetching,
  onRefresh,
  onOpenProfile,
}: DashboardHeaderProps) {
  const router = useRouter();

  const handleLogout = () => {
    // In a real app, you'd clear session/token here
    router.push('/login');
  };
  
  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60 sm:h-16 sm:px-6">
      <div className="flex items-center gap-2">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 256 256"
          className="h-6 w-6 text-primary"
        >
          <rect width="256" height="256" fill="none" />
          <path
            d="M88,112a40,40,0,1,1,40,40"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="16"
          />
          <path
            d="M168,144a40,40,0,1,1-40-40"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="16"
          />
          <path
            d="M112,88a40,40,0,1,1-40-40"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="16"
          />
          <path
            d="M144,168a40,40,0,1,1,40-40"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="16"
          />
          <circle cx="128" cy="128" r="96" fill="none" stroke="currentColor" strokeMiterlimit="10" strokeWidth="16"/>
        </svg>
        <h1 className="text-lg font-semibold md:text-xl">Quantum Observer</h1>
      </div>
      <div className="flex w-full items-center justify-end gap-2 md:gap-4">
        <div className="hidden items-center gap-4 md:flex">
          <div className="flex items-center gap-2">
            <Label htmlFor="demo-mode" className="text-sm font-medium">
              Demo
            </Label>
            <Switch id="demo-mode" checked={isDemo} onCheckedChange={onToggleDemo} />
          </div>
          <Separator orientation="vertical" className="h-6" />
          <div className="flex items-center gap-2">
            <Label htmlFor="auto-refresh" className="text-sm font-medium">
              Auto-refresh
            </Label>
            <Switch id="auto-refresh" checked={autoRefresh} onCheckedChange={onToggleRefresh} />
          </div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                  <Button variant="ghost" size="sm" onClick={onRefresh} disabled={isFetching}>
                      <RefreshCw className={`mr-2 h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
                      Refresh
                  </Button>
              </TooltipTrigger>
              <TooltipContent>
                  <p>Refresh data</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

        </div>
        
        <div className="hidden items-center gap-2 md:flex">
          <Button variant="outline" size="sm" onClick={onAnalyze}>
            <BrainCircuit className="mr-2 h-4 w-4" />
            Analyze Anomalies
          </Button>
        </div>

        <div className="flex items-center gap-2 md:hidden">
            <Button variant="outline" size="icon" onClick={onOpenFilters}>
                <SlidersHorizontal className="h-4 w-4" />
                 <span className="sr-only">Open Filters</span>
            </Button>
        </div>
        <ThemeToggle />

        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                   <Avatar>
                        <AvatarImage src="https://picsum.photos/seed/user/32/32" data-ai-hint="profile avatar" />
                        <AvatarFallback>
                            <User />
                        </AvatarFallback>
                    </Avatar>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onOpenProfile}>Profile</DropdownMenuItem>
                <DropdownMenuItem>Settings</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>Logout</DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
