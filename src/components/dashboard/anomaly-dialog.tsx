"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { AlertTriangle, CheckCircle, BrainCircuit } from "lucide-react"
import type { Job, Anomaly } from "@/lib/types"
import { useToast } from "@/hooks/use-toast"
import { analyzeJobAnomalies } from "@/ai/flows/analyze-job-anomalies"

interface AnomalyDialogProps {
  jobs: Job[];
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

export function AnomalyDialog({ jobs, isOpen, onOpenChange }: AnomalyDialogProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<{anomalies: Anomaly[], summary: string} | null>(null)
  const [hasAnalyzed, setHasAnalyzed] = useState(false)
  const { toast } = useToast()

  const handleAnalysis = async () => {
    setIsLoading(true)
    setAnalysisResult(null)
    setHasAnalyzed(true)
    try {
      const jobData = JSON.stringify(jobs.map(({ id, status, backend, submitted, elapsed_time, status_history }) => ({ id, status, backend, submitted, elapsed_time, status_history })));
      const result = await analyzeJobAnomalies({ jobData })
      setAnalysisResult(result)
    } catch (error) {
      console.error("Analysis failed:", error)
      toast({
        variant: "destructive",
        title: "Analysis Failed",
        description: "Could not analyze job data. Please try again.",
      })
    } finally {
      setIsLoading(false)
    }
  }
  
  const handleClose = (open: boolean) => {
    if (!open) {
      setAnalysisResult(null)
      setHasAnalyzed(false)
    }
    onOpenChange(open)
  }

  const getSeverityIcon = (severity: "low" | "medium" | "high") => {
    switch (severity) {
      case 'high':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'medium':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-blue-500" />;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Job Anomaly Detection</DialogTitle>
          <DialogDescription>
            Use AI to analyze the current set of jobs for unusual patterns or potential issues.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-4 max-h-[60vh] overflow-y-auto">
          {isLoading && (
            <div className="space-y-4">
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
          )}
          
          {!isLoading && analysisResult && (
            <div className="space-y-4">
              <Alert variant="default" className="bg-primary/10 border-primary/20">
                <CheckCircle className="h-4 w-4 text-primary" />
                <AlertTitle>Analysis Summary</AlertTitle>
                <AlertDescription>{analysisResult.summary}</AlertDescription>
              </Alert>
              {analysisResult.anomalies.length > 0 ? (
                analysisResult.anomalies.map((anomaly, index) => (
                  <Alert key={index} variant={anomaly.severity === 'high' ? 'destructive' : 'default'}>
                    {getSeverityIcon(anomaly.severity)}
                    <AlertTitle>Anomaly Detected (Severity: {anomaly.severity})</AlertTitle>
                    <AlertDescription>
                      <span className="font-semibold font-mono text-xs pr-2">{anomaly.jobId}</span>
                      {anomaly.anomalyDescription}
                    </AlertDescription>
                  </Alert>
                ))
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  <CheckCircle className="mx-auto h-12 w-12 text-green-500" />
                  <p className="mt-4">No anomalies detected in the current dataset.</p>
                </div>
              )}
            </div>
          )}
          
          {!isLoading && !hasAnalyzed && (
             <div className="text-center text-muted-foreground py-8">
                <BrainCircuit className="mx-auto h-12 w-12" />
                <p className="mt-4">Ready to analyze {jobs.length} jobs.</p>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => handleClose(false)}>Close</Button>
          <Button onClick={handleAnalysis} disabled={isLoading}>
            {isLoading ? "Analyzing..." : "Run Analysis"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
