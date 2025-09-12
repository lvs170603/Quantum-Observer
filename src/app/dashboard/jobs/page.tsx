
'use client';

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Download, FileText, MoreVertical, RefreshCw, Search } from "lucide-react";
import type { Job, JobStatus } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { JobDetailsDrawer } from "@/components/dashboard/job-details-drawer";
import { ExportDialog } from "@/components/dashboard/export-dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

const statusStyles: Record<Job['status'], string> = {
  COMPLETED: "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300 border-green-200 dark:border-green-700/80",
  RUNNING: "bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300 border-blue-200 dark:border-blue-700/80 animate-pulse",
  QUEUED: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300 border-yellow-200 dark:border-yellow-700/80",
  ERROR: "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300 border-red-200 dark:border-red-700/80",
  CANCELLED: "bg-gray-100 text-gray-800 dark:bg-gray-900/50 dark:text-gray-400 border-gray-200 dark:border-gray-700/80",
  UNKNOWN: "bg-gray-100 text-gray-800 dark:bg-gray-900/50 dark:text-gray-400 border-gray-200 dark:border-gray-700/80",
};

const JOBS_PER_PAGE_OPTIONS = [10, 20, 50];

export default function AllJobsPage() {
  const router = useRouter();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isFetching, setIsFetching] = useState(true);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [jobsToExport, setJobsToExport] = useState<Job[]>([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<JobStatus | "all">("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [jobsPerPage, setJobsPerPage] = useState(JOBS_PER_PAGE_OPTIONS[0]);
  const { toast } = useToast();

  const fetchData = useCallback(async () => {
    setIsFetching(true);
    const url = `/api/mock?demo=true`; 
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setJobs(data.jobs);
    } catch (error) {
      console.error("Failed to fetch jobs:", error);
      toast({
        variant: "destructive",
        title: "Error fetching jobs",
        description: "Could not retrieve the full list of jobs.",
      });
    } finally {
      setIsFetching(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);
  
  const filteredJobs = useMemo(() => {
    let filtered = jobs;
    if (statusFilter !== 'all') {
      filtered = filtered.filter(job => job.status === statusFilter);
    }
    if (searchQuery) {
      filtered = filtered.filter(job =>
        job.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.user.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    return filtered;
  }, [jobs, searchQuery, statusFilter]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter, jobsPerPage]);

  const totalPages = Math.ceil(filteredJobs.length / jobsPerPage);
  const paginatedJobs = filteredJobs.slice(
    (currentPage - 1) * jobsPerPage,
    currentPage * jobsPerPage
  );

  const handleJobSelect = (job: Job) => {
    setSelectedJob(job);
    setIsDrawerOpen(true);
  };

  const handleExportClick = (jobs: Job[]) => {
    setJobsToExport(jobs);
    setIsExportDialogOpen(true);
  };
  
  const handleCopy = (id: string) => {
    navigator.clipboard.writeText(id);
    toast({
      title: "Copied!",
      description: "Job ID has been copied to your clipboard.",
    });
  };

  const handleNextPage = () => {
    setCurrentPage(prev => Math.min(prev + 1, totalPages));
  };

  const handlePrevPage = () => {
    setCurrentPage(prev => Math.max(prev - 1, 1));
  };

  return (
    <div className="flex min-h-screen w-full flex-col bg-background text-foreground">
      <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60 sm:h-16 sm:px-6">
        <Button variant="outline" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
          <span className="sr-only">Go Back</span>
        </Button>
        <h1 className="text-lg font-semibold md:text-xl">All Jobs</h1>
      </header>
      <main className="flex flex-1 flex-col gap-4 p-4 sm:p-6">
        <Card>
          <CardHeader>
             <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <FileText className="h-6 w-6 text-muted-foreground" />
                <div>
                  <CardTitle>All Jobs ({filteredJobs.length})</CardTitle>
                  <CardDescription>A complete list of all jobs in the system.</CardDescription>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row items-center gap-2 w-full md:w-auto">
                 <div className="relative w-full md:w-auto">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="search"
                      placeholder="Search..."
                      className="w-full pl-8 sm:w-[180px] lg:w-[200px]"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                 <div className="grid gap-1.5 w-full sm:w-auto">
                    <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as any)}>
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
                 </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon" onClick={fetchData} disabled={isFetching}>
                        <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
                         <span className="sr-only">Refresh</span>
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleExportClick(filteredJobs)}>
                        <Download className="mr-2 h-4 w-4" />
                        Export
                    </Button>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Job ID</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Backend</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead><span className="sr-only">Actions</span></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isFetching ? (
                  Array.from({ length: jobsPerPage }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell colSpan={6} className="h-12 text-center">
                        <span className="animate-pulse">Loading...</span>
                      </TableCell>
                    </TableRow>
                  ))
                ) : paginatedJobs.length > 0 ? (
                  paginatedJobs.map((job) => (
                    <TableRow key={job.id} >
                      <TableCell onClick={() => handleJobSelect(job)} className="font-mono text-xs truncate max-w-[100px] sm:max-w-xs cursor-pointer">{job.id}</TableCell>
                      <TableCell onClick={() => handleJobSelect(job)} className="cursor-pointer">
                        <Badge variant="outline" className={statusStyles[job.status]}>
                          {job.status}
                        </Badge>
                      </TableCell>
                      <TableCell onClick={() => handleJobSelect(job)} className="cursor-pointer">{job.backend}</TableCell>
                      <TableCell onClick={() => handleJobSelect(job)} className="cursor-pointer">
                        {formatDistanceToNow(new Date(job.submitted), { addSuffix: true })}
                      </TableCell>
                      <TableCell onClick={() => handleJobSelect(job)} className="cursor-pointer">{job.user}</TableCell>
                       <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Open menu</span>
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleJobSelect(job)}>
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleCopy(job.id)}>
                              Copy ID
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleExportClick([job])}>
                              Download
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      No results found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
          <CardFooter className="flex items-center justify-between">
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>Page {currentPage} of {totalPages > 0 ? totalPages : 1}</span>
              <div className="flex items-center gap-2">
                <Label>Rows per page</Label>
                 <Select value={jobsPerPage.toString()} onValueChange={(value) => setJobsPerPage(Number(value))}>
                  <SelectTrigger className="w-[70px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {JOBS_PER_PAGE_OPTIONS.map(option => (
                       <SelectItem key={option} value={option.toString()}>{option}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrevPage}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleNextPage}
                disabled={currentPage === totalPages || totalPages === 0}
              >
                Next
              </Button>
            </div>
          </CardFooter>
        </Card>
      </main>
       <JobDetailsDrawer
        job={selectedJob}
        isOpen={isDrawerOpen}
        onOpenChange={setIsDrawerOpen}
      />
      <ExportDialog
        jobs={jobsToExport}
        isOpen={isExportDialogOpen}
        onOpenChange={setIsExportDialogOpen}
      />
    </div>
  );
}
