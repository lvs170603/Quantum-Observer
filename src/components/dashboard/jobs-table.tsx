
"use client"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge"
import type { Job, JobStatus } from "@/lib/types"
import { formatDistanceToNow } from "date-fns"
import { Button } from "../ui/button"
import { ListFilter, MoreHorizontal, Search } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface JobsTableProps {
  jobs: Job[];
  onJobSelect: (job: Job) => void;
  currentPage: number;
  totalPages: number;
  onNextPage: () => void;
  onPrevPage: () => void;
  searchQuery: string;
  onSearchQueryChange: (query: string) => void;
  statusFilter: JobStatus | "all";
  onStatusFilterChange: (status: JobStatus | "all") => void;
  backendFilter: string;
  onBackendFilterChange: (backend: string) => void;
  allBackends: string[];
  isFetching: boolean;
}

const statusStyles: Record<JobStatus, string> = {
  COMPLETED: "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300 border-green-200 dark:border-green-700/80",
  RUNNING: "bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300 border-blue-200 dark:border-blue-700/80 animate-pulse",
  QUEUED: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300 border-yellow-200 dark:border-yellow-700/80",
  ERROR: "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300 border-red-200 dark:border-red-700/80",
  CANCELLED: "bg-gray-100 text-gray-800 dark:bg-gray-900/50 dark:text-gray-400 border-gray-200 dark:border-gray-700/80",
  UNKNOWN: "bg-gray-100 text-gray-800 dark:bg-gray-900/50 dark:text-gray-400 border-gray-200 dark:border-gray-700/80",
};

export function JobsTable({
  jobs,
  onJobSelect,
  currentPage,
  totalPages,
  onNextPage,
  onPrevPage,
  searchQuery,
  onSearchQueryChange,
  statusFilter,
  onStatusFilterChange,
  backendFilter,
  onBackendFilterChange,
  allBackends,
  isFetching
}: JobsTableProps) {
  const { toast } = useToast();
  
  const handleCopy = (id: string) => {
    navigator.clipboard.writeText(id);
    toast({
      title: "Copied!",
      description: "Job ID has been copied to your clipboard.",
    });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex-1">
                <CardTitle>Live Jobs</CardTitle>
                <CardDescription>Recent and ongoing quantum jobs.</CardDescription>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-2 w-full md:w-auto">
                <div className="relative w-full md:w-auto">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Search jobs..."
                        className="w-full pl-8 sm:w-[150px] lg:w-[200px]"
                        value={searchQuery}
                        onChange={(e) => onSearchQueryChange(e.target.value)}
                    />
                </div>
                <Select value={statusFilter} onValueChange={(value) => onStatusFilterChange(value as any)}>
                    <SelectTrigger className="w-full sm:w-[150px]">
                        <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        <SelectItem value="COMPLETED">Completed</SelectItem>
                        <SelectItem value="RUNNING">Running</SelectItem>
                        <SelectItem value="QUEUED">Queued</SelectItem>
                        <SelectItem value="ERROR">Error</SelectItem>
                        <SelectItem value="CANCELLED">Cancelled</SelectItem>
                    </SelectContent>
                </Select>
                 <Select value={backendFilter} onValueChange={(value) => onBackendFilterChange(value as any)}>
                    <SelectTrigger className="w-full sm:w-[150px]">
                        <SelectValue placeholder="Filter by backend" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Backends</SelectItem>
                        {allBackends.map(backend => (
                            <SelectItem key={backend} value={backend}>{backend}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <Link href="/dashboard/jobs" passHref>
                    <Button variant="outline" size="sm" className="w-full sm:w-auto">
                        <ListFilter className="mr-2 h-4 w-4" />
                        View All
                    </Button>
                </Link>
            </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="relative">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Job ID</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden md:table-cell">Backend</TableHead>
                <TableHead className="hidden sm:table-cell">Submitted</TableHead>
                <TableHead>User</TableHead>
                <TableHead><span className="sr-only">Actions</span></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isFetching && jobs.length === 0 ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell colSpan={6} className="h-12 text-center">
                      <span className="animate-pulse">Loading...</span>
                    </TableCell>
                  </TableRow>
                ))
              ) : jobs.length > 0 ? (
                  jobs.map((job) => (
                    <TableRow key={job.id}>
                      <TableCell onClick={() => onJobSelect(job)} className="font-mono text-xs truncate max-w-[100px] sm:max-w-xs cursor-pointer">{job.id}</TableCell>
                      <TableCell onClick={() => onJobSelect(job)} className="cursor-pointer">
                        <Badge variant="outline" className={statusStyles[job.status]}>
                          {job.status}
                        </Badge>
                      </TableCell>
                      <TableCell onClick={() => onJobSelect(job)} className="hidden md:table-cell cursor-pointer">{job.backend}</TableCell>
                      <TableCell onClick={() => onJobSelect(job)} className="hidden sm:table-cell cursor-pointer">
                        {formatDistanceToNow(new Date(job.submitted), { addSuffix: true })}
                      </TableCell>
                      <TableCell onClick={() => onJobSelect(job)} className="cursor-pointer">{job.user}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                    <span className="sr-only">Open menu</span>
                                    <MoreHorizontal className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => onJobSelect(job)}>View Details</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleCopy(job.id)}>Copy ID</DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
              ) : (
                 <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      No results found for your filters.
                    </TableCell>
                  </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
       <CardFooter className="flex items-center justify-between">
        <div className="text-xs text-muted-foreground">
          Showing page {currentPage} of {totalPages > 0 ? totalPages : 1}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onPrevPage}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onNextPage}
            disabled={currentPage === totalPages || totalPages === 0}
          >
            Next
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}
