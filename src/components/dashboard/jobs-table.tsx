"use client"

import {
  Card,
  CardContent,
  CardDescription,
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
import { Badge } from "@/components/ui/badge"
import type { Job, JobStatus } from "@/lib/types"
import { formatDistanceToNow } from "date-fns"

interface JobsTableProps {
  jobs: Job[];
  onJobSelect: (job: Job) => void;
}

const statusStyles: Record<JobStatus, string> = {
  COMPLETED: "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300 border-green-200 dark:border-green-700/80",
  RUNNING: "bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300 border-blue-200 dark:border-blue-700/80 animate-pulse",
  QUEUED: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300 border-yellow-200 dark:border-yellow-700/80",
  ERROR: "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300 border-red-200 dark:border-red-700/80",
  CANCELLED: "bg-gray-100 text-gray-800 dark:bg-gray-900/50 dark:text-gray-400 border-gray-200 dark:border-gray-700/80",
};

export function JobsTable({ jobs, onJobSelect }: JobsTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Live Jobs</CardTitle>
        <CardDescription>A list of recent and ongoing quantum jobs.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="relative max-h-[600px] overflow-auto">
          <Table>
            <TableHeader className="sticky top-0 bg-card">
              <TableRow>
                <TableHead>Job ID</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden md:table-cell">Backend</TableHead>
                <TableHead className="hidden sm:table-cell">Submitted</TableHead>
                <TableHead className="hidden lg:table-cell">User</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {jobs.map((job) => (
                <TableRow key={job.id} onClick={() => onJobSelect(job)} className="cursor-pointer">
                  <TableCell className="font-mono text-xs truncate max-w-[100px] sm:max-w-xs">{job.id}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={statusStyles[job.status]}>
                      {job.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">{job.backend}</TableCell>
                  <TableCell className="hidden sm:table-cell">
                    {formatDistanceToNow(new Date(job.submitted), { addSuffix: true })}
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">{job.user}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
