"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Cpu, CheckCircle, Clock, AlertTriangle, MinusCircle } from "lucide-react"
import type { Backend } from "@/lib/types"

interface BackendsGridProps {
  backends: Backend[]
}

const statusConfig = {
  active: {
    icon: CheckCircle,
    color: "bg-green-500",
    label: "Active",
  },
  maintenance: {
    icon: Clock,
    color: "bg-yellow-500",
    label: "Maintenance",
  },
  inactive: {
    icon: MinusCircle,
    color: "bg-red-500",
    label: "Inactive",
  },
};


export function BackendsGrid({ backends }: BackendsGridProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Cpu className="h-5 w-5" />
          Backend Health
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Backend</TableHead>
              <TableHead>Qubits</TableHead>
              <TableHead>Queue</TableHead>
              <TableHead>E. Rate</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {backends.map((backend) => {
               const config = statusConfig[backend.status];
               return (
                <TableRow key={backend.name}>
                    <TableCell>
                        <div className="flex items-center gap-2">
                            <span className={`h-2 w-2 rounded-full ${config.color}`} />
                            <span className="font-medium">{backend.name}</span>
                        </div>
                    </TableCell>
                    <TableCell className="text-center">{backend.qubit_count}</TableCell>
                    <TableCell className="text-center">{backend.queue_depth}</TableCell>
                    <TableCell className="text-right">{(backend.error_rate * 100).toFixed(3)}%</TableCell>
                </TableRow>
               )
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
