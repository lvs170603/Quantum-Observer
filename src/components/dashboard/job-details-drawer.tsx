
"use client"

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import type { Job, JobStatus } from "@/lib/types"
import { formatDistanceToNow, format } from "date-fns"
import Image from "next/image"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"

interface JobDetailsDrawerProps {
  job: Job | null;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

const statusStyles: Record<JobStatus, string> = {
  COMPLETED: "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300 border-green-200 dark:border-green-700/80",
  RUNNING: "bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300 border-blue-200 dark:border-blue-700/80",
  QUEUED: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300 border-yellow-200 dark:border-yellow-700/80",
  ERROR: "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300 border-red-200 dark:border-red-700/80",
  CANCELLED: "bg-gray-100 text-gray-800 dark:bg-gray-900/50 dark:text-gray-400 border-gray-200 dark:border-gray-700/80",
};

export function JobDetailsDrawer({ job, isOpen, onOpenChange }: JobDetailsDrawerProps) {
  if (!job) return null

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-xl">
        <SheetHeader>
          <SheetTitle className="font-mono break-all text-base">{job.id}</SheetTitle>
          <SheetDescription>
            Detailed information for job submitted by {job.user}.
          </SheetDescription>
        </SheetHeader>
        <ScrollArea className="h-[calc(100vh-8rem)] pr-6">
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="font-medium text-muted-foreground">Status</div>
              <div><Badge variant="outline" className={statusStyles[job.status]}>{job.status}</Badge></div>
              
              <div className="font-medium text-muted-foreground">Backend</div>
              <div>{job.backend}</div>
              
              <div className="font-medium text-muted-foreground">Submitted</div>
              <div>{format(new Date(job.submitted), "PPP p")}</div>

              <div className="font-medium text-muted-foreground">Elapsed Time</div>
              <div>{job.elapsed_time.toFixed(2)} seconds</div>
              
              <div className="font-medium text-muted-foreground">QPU Time</div>
              <div>{job.qpu_seconds.toFixed(2)} seconds</div>
            </div>
            
            <Separator />
            
            <div>
              <h4 className="mb-2 text-sm font-semibold">Status History</h4>
              <ul className="space-y-2 text-xs">
                {job.status_history.map(s => (
                  <li key={`${s.status}-${s.timestamp}`} className="flex items-center gap-2">
                    <Badge variant="secondary" className="w-24 justify-center">{s.status}</Badge>
                    <span>{format(new Date(s.timestamp), "p")} ({formatDistanceToNow(new Date(s.timestamp), { addSuffix: true })})</span>
                  </li>
                ))}
              </ul>
            </div>

            {job.circuit_image_url && (
              <>
                <Separator />
                <div>
                  <h4 className="mb-2 text-sm font-semibold">Quantum Circuit</h4>
                  <div className="rounded-md bg-muted p-2">
                    <Image
                      src={job.circuit_image_url}
                      alt="Quantum Circuit Diagram"
                      width={800}
                      height={200}
                      className="h-auto w-full rounded-md object-contain"
                      data-ai-hint="quantum circuit"
                    />
                  </div>
                </div>
              </>
            )}

             {!job.circuit_image_url && (
                <>
                <Separator />
                <div>
                  <h4 className="mb-2 text-sm font-semibold">Quantum Circuit</h4>
                  <div className="rounded-md bg-muted p-2">
                     <Skeleton className="h-[100px] w-full" />
                  </div>
                </div>
              </>
            )}
            
            <Separator />

            <div>
              <h4 className="mb-2 text-sm font-semibold">Logs</h4>
              <pre className="font-code overflow-x-auto rounded-md bg-muted p-2 text-xs">
                <code>{job.logs}</code>
              </pre>
            </div>

            <Separator />

            <div>
              <h4 className="mb-2 text-sm font-semibold">Results</h4>
              <pre className="font-code overflow-x-auto rounded-md bg-muted p-2 text-xs">
                <code>{Object.keys(job.results).length > 0 ? JSON.stringify(job.results, null, 2) : "No results available."}</code>
              </pre>
            </div>
          </div>
        </ScrollArea>
        <SheetFooter>
          {/* Action buttons like "Cancel Job" could go here */}
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
