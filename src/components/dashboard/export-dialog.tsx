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
import jsPDF from 'jspdf';

interface ExportDialogProps {
  jobs: Job[];
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

type ExportFormat = 'csv' | 'pdf' | 'json';

const downloadFile = (content: string, fileName: string, contentType: string) => {
  const blob = new Blob([content], { type: contentType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

const convertToCSV = (jobs: Job[]) => {
  if (jobs.length === 0) return '';
  const headers = ['id', 'status', 'backend', 'submitted', 'elapsed_time', 'user', 'qpu_seconds', 'logs', 'results', 'status_history', 'circuit_image_url'];
  const csvRows = [headers.join(',')];
  jobs.forEach(job => {
    const values = headers.map(header => {
      const value = job[header as keyof Job];
      
      if (value === null || value === undefined) {
        return '';
      }

      // Stringify complex objects
      if (typeof value === 'object') {
        return `"${JSON.stringify(value).replace(/"/g, '""')}"`;
      }
      
      const stringValue = String(value);
      // Escape double quotes and wrap in double quotes if it contains a comma
      if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
        return `"${stringValue.replace(/"/g, '""')}"`;
      }

      return stringValue;
    });
    csvRows.push(values.join(','));
  });
  return csvRows.join('\n');
};

const generatePDF = (jobs: Job[]) => {
  const doc = new jsPDF();
  let y = 15;
  doc.setFontSize(18);
  doc.text('Quantum Job Report', 14, y);
  y += 10;
  
  jobs.forEach((job, index) => {
    if (y > 280) { // Add new page if content overflows
      doc.addPage();
      y = 15;
    }
    doc.setFontSize(12);
    doc.text(`Job ${index + 1}`, 14, y);
    y += 7;
    doc.setFontSize(10);
    doc.text(`ID: ${job.id}`, 16, y);
    y += 5;
    doc.text(`Status: ${job.status}`, 16, y);
    y += 5;
    doc.text(`Backend: ${job.backend}`, 16, y);
    y += 5;
    doc.text(`Submitted: ${job.submitted}`, 16, y);
    y += 10;
  });

  doc.save(`quantum_jobs_${new Date().toISOString()}.pdf`);
};

export function ExportDialog({ jobs, isOpen, onOpenChange }: ExportDialogProps) {
  const [format, setFormat] = useState<ExportFormat>('csv');
  const { toast } = useToast();

  const handleExport = () => {
    switch (format) {
      case 'csv':
        const csvData = convertToCSV(jobs);
        downloadFile(csvData, `quantum_jobs_${new Date().toISOString()}.csv`, 'text/csv;charset=utf-8;');
        break;
      case 'json':
        const jsonData = JSON.stringify(jobs, null, 2);
        downloadFile(jsonData, `quantum_jobs_${new Date().toISOString()}.json`, 'application/json;charset=utf-8;');
        break;
      case 'pdf':
        generatePDF(jobs);
        break;
    }

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
          <RadioGroup defaultValue="csv" onValueChange={(value: ExportFormat) => setFormat(value)} className="space-y-2">
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
