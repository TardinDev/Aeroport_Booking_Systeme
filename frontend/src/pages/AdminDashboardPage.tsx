import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  Users,
  Plane,
  Ticket,
  DollarSign,
  CheckCircle2,
  XCircle,
  Clock,
  ShieldCheck,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { adminApi } from "@/api/admin.api";
import { formatCurrency } from "@/lib/utils";

interface KpiCardProps {
  label: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  isLoading?: boolean;
}

function KpiCard({ label, value, icon: Icon, color, isLoading }: KpiCardProps) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4 p-6">
        <div
          className={`flex h-12 w-12 items-center justify-center rounded-full ${color}`}
        >
          <Icon className="h-6 w-6 text-white" />
        </div>
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          {isLoading ? (
            <Skeleton className="h-8 w-24 mt-1" />
          ) : (
            <p className="text-2xl font-bold">{value}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export function AdminDashboardPage() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["admin", "dashboard"],
    queryFn: adminApi.getDashboard,
  });

  const { data: auditLogs, isLoading: auditLoading } = useQuery({
    queryKey: ["admin", "audit-logs"],
    queryFn: () => adminApi.getAuditLogs(0, 20),
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 flex items-center gap-3"
      >
        <ShieldCheck className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Platform KPIs and operational oversight
          </p>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <KpiCard
          label="Total users"
          value={stats?.totalUsers ?? "-"}
          icon={Users}
          color="bg-blue-600"
          isLoading={isLoading}
        />
        <KpiCard
          label="Total flights"
          value={stats?.totalFlights ?? "-"}
          icon={Plane}
          color="bg-purple-600"
          isLoading={isLoading}
        />
        <KpiCard
          label="Total bookings"
          value={stats?.totalBookings ?? "-"}
          icon={Ticket}
          color="bg-emerald-600"
          isLoading={isLoading}
        />
        <KpiCard
          label="Total revenue"
          value={
            stats?.totalRevenue != null
              ? formatCurrency(Number(stats.totalRevenue))
              : "-"
          }
          icon={DollarSign}
          color="bg-amber-600"
          isLoading={isLoading}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <KpiCard
          label="Pending bookings"
          value={stats?.pendingBookings ?? "-"}
          icon={Clock}
          color="bg-yellow-500"
          isLoading={isLoading}
        />
        <KpiCard
          label="Confirmed"
          value={stats?.confirmedBookings ?? "-"}
          icon={CheckCircle2}
          color="bg-green-600"
          isLoading={isLoading}
        />
        <KpiCard
          label="Cancelled"
          value={stats?.cancelledBookings ?? "-"}
          icon={XCircle}
          color="bg-red-600"
          isLoading={isLoading}
        />
        <KpiCard
          label="Completed"
          value={stats?.completedBookings ?? "-"}
          icon={CheckCircle2}
          color="bg-indigo-600"
          isLoading={isLoading}
        />
      </div>

      <Tabs defaultValue="audit" className="w-full">
        <TabsList>
          <TabsTrigger value="audit">Audit logs</TabsTrigger>
          <TabsTrigger value="operations">Operations</TabsTrigger>
        </TabsList>

        <TabsContent value="audit" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent audit logs</CardTitle>
              <CardDescription>
                Sensitive operations are logged here for traceability.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {auditLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : !auditLogs || auditLogs.content.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No audit logs yet.
                </p>
              ) : (
                <div className="divide-y">
                  {auditLogs.content.map((log) => (
                    <div
                      key={log.id}
                      className="flex items-center justify-between py-3"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{log.action}</Badge>
                          <span className="text-sm font-medium">
                            {log.entity}#{log.entityId}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {log.userEmail ?? "system"} —{" "}
                          {new Date(log.createdAt).toLocaleString()}
                        </p>
                      </div>
                      {log.details && (
                        <span className="text-xs text-muted-foreground max-w-[40%] truncate">
                          {log.details}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="operations" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Operational tools</CardTitle>
              <CardDescription>
                Advanced management (flights, users, refunds) — coming soon.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                CRUD flight management, user role assignment and refund
                handling will be available in this section.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
