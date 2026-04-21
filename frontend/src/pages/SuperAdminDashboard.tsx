import { useEffect, useMemo, useState } from "react";
import {
  Bell,
  BookOpen,
  Calendar,
  ChevronDown,
  Download,
  LayoutDashboard,
  LineChart,
  Search,
  Settings,
  Ticket,
  UserPlus,
  Users,
} from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { adminAPI } from "../services/api";
import type { AdminDashboardActivity, AdminDashboardData } from "../types";
import "../styles/SuperAdminDashboard.css";

const SuperAdminDashboard = () => {
  const [dashboard, setDashboard] = useState<AdminDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const loadDashboard = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await adminAPI.getDashboard();
        if (!cancelled) {
          setDashboard(response.dashboard);
        }
      } catch (err) {
        if (!cancelled) {
          setError("Could not load admin dashboard data.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void loadDashboard();

    return () => {
      cancelled = true;
    };
  }, []);

  const generatedAt = useMemo(() => {
    const source = dashboard?.generatedAt
      ? new Date(dashboard.generatedAt)
      : new Date();
    return {
      date: source.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
      time: source.toUTCString().split(" ")[4] ?? "00:00:00",
    };
  }, [dashboard?.generatedAt]);

  const metrics = dashboard?.metrics;
  const chartData = dashboard?.chart ?? [];
  const activities = dashboard?.activities ?? [];

  const grossSales = formatCurrency(metrics?.grossSalesVolume ?? 0);
  const ticketsProcessed = formatNumber(metrics?.ticketsProcessed ?? 0);
  const activeEvents = formatNumber(metrics?.activeEvents ?? 0);
  const totalUsers = formatNumber(metrics?.totalRegisteredUsers ?? 0);

  return (
    <div className="super-admin-page">
      <aside className="sa-sidebar">
        <div className="sa-brand">
          <div className="sa-brand-left">
            <BookOpen size={18} className="sa-book" />
            <span className="sa-brand-name">EventHub</span>
            <span className="sa-brand-role">ADMIN</span>
          </div>
        </div>

        <nav className="sa-nav">
          <div className="sa-nav-section">
            <p className="sa-nav-title">Platform Overview</p>
            <NavItem
              icon={<LayoutDashboard size={18} />}
              label="Dashboard"
              active
            />
            <NavItem icon={<Users size={18} />} label="User Management" />
            <NavItem icon={<Calendar size={18} />} label="Event Monitoring" />
            <NavItem icon={<LineChart size={18} />} label="Analytics" />
          </div>

          <div className="sa-nav-section">
            <p className="sa-nav-title">System Configuration</p>
            <NavItem icon={<Settings size={18} />} label="Settings" />
            <NavItem icon={<Ticket size={18} />} label="Integrations" />
          </div>
        </nav>

        <div className="sa-sidebar-footer">
          <div className="sa-admin-chip">
            <div className="sa-admin-chip-main">
              <div className="sa-avatar">SA</div>
              <div>
                <div className="sa-admin-name">System Admin</div>
                <div className="sa-admin-sub">Superuser Role</div>
              </div>
            </div>
            <ChevronDown size={16} color="#8fa2d8" />
          </div>
        </div>
      </aside>

      <main className="sa-main">
        <header className="sa-topbar">
          <div className="sa-search-wrap">
            <Search size={17} className="sa-search-icon" />
            <input
              className="sa-search"
              placeholder="Search events, users, or IDs..."
            />
            <span className="sa-shortcut">⌘K</span>
          </div>

          <div className="sa-topbar-right">
            <div className="sa-sync-chip">
              <span className="sa-sync-dot" />
              System Sync Active
            </div>

            <button
              className="sa-icon-btn"
              type="button"
              aria-label="Notifications"
            >
              <Bell size={18} />
              <span className="sa-dot" />
            </button>

            <span className="sa-divider" />

            <button className="sa-user" type="button">
              Admin_Primary
              <ChevronDown size={15} />
            </button>
          </div>
        </header>

        <section className="sa-content">
          <div className="sa-overview-head">
            <div>
              <h1>System Overview</h1>
              <p>Real-time metrics for EventHub platform operations.</p>
            </div>

            <div className="sa-overview-date">
              <div>
                <strong>{generatedAt.date}</strong>
                {generatedAt.time} UTC
              </div>
              <button
                className="sa-download"
                type="button"
                aria-label="Export snapshot"
              >
                <Download size={15} />
              </button>
            </div>
          </div>

          <div className="sa-metric-grid">
            <MetricCard
              title="Gross Sales\nVolume"
              value={grossSales}
              chip={`${formatPct(metrics?.grossSalesChangePct ?? 0)}%`}
              trend="vs last month"
              icon={
                <span
                  style={{ color: "#6266f1", fontSize: 24, fontWeight: 700 }}
                >
                  $
                </span>
              }
              iconBg="#eef0ff"
            />
            <MetricCard
              title="Tickets Processed"
              value={ticketsProcessed}
              chip={`${formatPct(metrics?.ticketsChangePct ?? 0)}%`}
              trend="vs last month"
              icon={<Ticket size={16} color="#4f73f4" />}
              iconBg="#eaf0ff"
            />
            <MetricCard
              title="Active Events"
              value={activeEvents}
              chip={`${formatPct(metrics?.activeEventsChangePct ?? 0)}%`}
              trend="capacity steady"
              icon={<Calendar size={16} color="#f59e0b" />}
              iconBg="#fff4dc"
              flat
            />
            <MetricCard
              title="Total Registered\nUsers"
              value={totalUsers}
              chip={`${formatPct(metrics?.newSignupsChangePct ?? 0)}%`}
              trend="new signups this week"
              icon={<Users size={16} color="#a855f7" />}
              iconBg="#f6ecff"
            />
          </div>

          <div className="sa-panels">
            <article className="sa-chart-card">
              <div className="sa-chart-head">
                <div>
                  <h2 className="sa-chart-title">
                    User Growth & Ticket Volume
                  </h2>
                  <p className="sa-chart-sub">
                    7-day rolling performance metrics
                  </p>
                </div>
                <div className="sa-range">
                  <button className="active" type="button">
                    7D
                  </button>
                  <button type="button">30D</button>
                  <button type="button">1Y</button>
                </div>
              </div>

              <div className="sa-chart">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={chartData}
                    margin={{ top: 10, right: 12, left: -20, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="saUsers" x1="0" y1="0" x2="0" y2="1">
                        <stop
                          offset="5%"
                          stopColor="#5b7af7"
                          stopOpacity={0.3}
                        />
                        <stop
                          offset="95%"
                          stopColor="#5b7af7"
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid stroke="#e8eef9" vertical={false} />
                    <XAxis
                      dataKey="day"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "#8091ac", fontSize: 12 }}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "#8091ac", fontSize: 12 }}
                      tickFormatter={(value: number) => formatChartTick(value)}
                    />
                    <Tooltip
                      cursor={{ stroke: "#c6d4f5", strokeWidth: 1 }}
                      contentStyle={{
                        borderRadius: 10,
                        border: "1px solid #e1e8f6",
                        boxShadow: "0 8px 26px rgba(23, 40, 94, 0.09)",
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="users"
                      stroke="#5b7af7"
                      strokeWidth={2.2}
                      fill="url(#saUsers)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </article>

            <aside className="sa-feed-card">
              <div className="sa-feed-head">
                <h2 className="sa-feed-title">Platform Activity</h2>
                <span className="sa-live">Live Feed</span>
              </div>

              <ul className="sa-feed-list">
                {activities.length > 0 ? (
                  activities.map((item, index) => (
                    <FeedItem
                      key={`${item.title}-${item.time}-${index}`}
                      iconColor={getFeedStyles(item).iconColor}
                      icon={getFeedStyles(item).icon}
                      title={item.title}
                      time={item.time}
                      text={item.text}
                    />
                  ))
                ) : (
                  <FeedItem
                    iconColor="#e8f1ff"
                    icon={<Bell size={14} color="#3f7bfb" />}
                    title={
                      loading
                        ? "Loading activity"
                        : error
                          ? "Activity unavailable"
                          : "No activity yet"
                    }
                    time=""
                    text={
                      loading
                        ? "Fetching latest platform updates."
                        : error
                          ? "Please refresh to try again."
                          : "New platform activity will appear here."
                    }
                  />
                )}
              </ul>
            </aside>
          </div>

          {error && (
            <p style={{ marginTop: 12, color: "#be123c", fontWeight: 600 }}>
              {error}
            </p>
          )}
        </section>
      </main>
    </div>
  );
};

function NavItem({
  icon,
  label,
  active = false,
}: {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
}) {
  return (
    <button className={`sa-nav-item ${active ? "active" : ""}`} type="button">
      {icon}
      {label}
    </button>
  );
}

function MetricCard({
  title,
  value,
  chip,
  trend,
  icon,
  iconBg,
  flat = false,
}: {
  title: string;
  value: string;
  chip: string;
  trend: string;
  icon: React.ReactNode;
  iconBg: string;
  flat?: boolean;
}) {
  return (
    <div className="sa-metric-card">
      <div className="sa-metric-head">
        <h3 className="sa-metric-title">{title}</h3>
        <span className="sa-metric-icon" style={{ backgroundColor: iconBg }}>
          {icon}
        </span>
      </div>

      <div className="sa-metric-value">{value}</div>

      <div className="sa-metric-sub">
        <span className={`sa-badge ${flat ? "flat" : "up"}`}>
          {flat ? "−" : "↗"} {chip}
        </span>
        {trend}
      </div>
    </div>
  );
}

function FeedItem({
  iconColor,
  icon,
  title,
  time,
  text,
}: {
  iconColor: string;
  icon: React.ReactNode;
  title: string;
  time: string;
  text: string;
}) {
  return (
    <li className="sa-feed-item">
      <div className="sa-feed-dot" style={{ backgroundColor: iconColor }}>
        {icon}
      </div>
      <div className="sa-feed-content">
        <div className="sa-feed-row">
          <strong>{title}</strong>
          <span className="sa-feed-time">{time}</span>
        </div>
        <p className="sa-feed-text">{text}</p>
      </div>
    </li>
  );
}

function getFeedStyles(activity: AdminDashboardActivity): {
  iconColor: string;
  icon: React.ReactNode;
} {
  if (activity.kind === "user") {
    return {
      iconColor: "#e8f1ff",
      icon: <UserPlus size={14} color="#3f7bfb" />,
    };
  }

  if (activity.kind === "event") {
    return {
      iconColor: "#e8f1ff",
      icon: <Calendar size={14} color="#3f7bfb" />,
    };
  }

  return {
    iconColor: "#fff0d9",
    icon: <Ticket size={14} color="#f59e0b" />,
  };
}

function formatNumber(value: number): string {
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(
    value,
  );
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    notation: "compact",
    maximumFractionDigits: 2,
  }).format(value);
}

function formatPct(value: number): string {
  return value.toFixed(1);
}

function formatChartTick(value: number): string {
  if (value >= 1000) {
    return `${Math.round(value / 1000)}k`;
  }

  return String(value);
}

export default SuperAdminDashboard;
