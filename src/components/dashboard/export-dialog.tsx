
'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import type { Job } from '@/lib/types';
import { DownloadCloud } from 'lucide-react';

interface ExportDialogProps {
  jobs: Job[];
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

type ExportFormat = 'csv' | 'pdf' | 'excel' | 'json';

export function ExportDialog({ jobs, isOpen, onOpenChange }: ExportDialogProps) {
  const [format, setFormat] = useState<ExportFormat>('csv');
  const { toast } = useToast();

  const handleExport = () => {
    // In a real application, this would trigger a file download.
    // For this prototype, we'll just show a toast notification.
    console.log(`Exporting ${jobs.length} jobs as ${format.toUpperCase()}`);

    toast({
      title: 'Export Initiated',
      description: `Your download for the job data as a ${format.toUpperCase()} file will begin shortly.`,
    });

    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Export Job Data</DialogTitle>
          <DialogDescription>
            Select a format to export the current list of {jobs.length} jobs.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <RadioGroup defaultValue="csv" onValueChange={(value: ExportFormat) => setFormat(value)}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="csv" id="csv" />
              <Label htmlFor="csv">CSV (Comma-Separated Values)</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="json" id="json" />
              <Label htmlFor="json">JSON (JavaScript Object Notation)</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="pdf" id="pdf" />
              <Label htmlFor="pdf">PDF (Portable Document Format)</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="excel" id="excel" />
              <Label htmlFor="excel">Excel (XLSX)</Label>
            </div>
          </RadioGroup>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleExport}>
            <DownloadCloud className="mr-2 h-4 w-4" />
            Download
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
