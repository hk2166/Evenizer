import React from 'react';
import { 
  Search, Bell, Download, Plus, LayoutDashboard, Users, 
  Activity, BarChart3, Wallet, Shield, Settings as SettingsIcon,
  ChevronDown, TrendingUp, MoreVertical, Eye, Ban
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';

// Dummy data for the chart
const data = [
  { name: '01', users: 4000 },
  { name: '03', users: 3000 },
  { name: '05', users: 2000 },
  { name: '07', users: 2780 },
  { name: '09', users: 1890 },
  { name: '11', users: 2390 },
  { name: '13', users: 3490 },
  { name: '15', users: 4000 },
  { name: '17', users: 3000 },
  { name: '19', users: 2000 },
  { name: '21', users: 2780 },
  { name: '23', users: 3890 },
];

const AdminDashboard = () => {
  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-800 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-[#0f172a] text-slate-300 flex flex-col flex-shrink-0">
        <div className="h-16 flex items-center px-6 border-b border-slate-800">
          <div className="flex items-center gap-2 text-white font-bold text-xl tracking-tight">
            <div className="w-6 h-6 rounded bg-indigo-500 flex items-center justify-center">
              <span className="text-white text-xs">E</span>
            </div>
            EventHub
          </div>
        </div>

        <div className="flex-1 overflow-y-auto py-4 flex flex-col gap-1 px-3">
          <NavItem icon={<LayoutDashboard size={18} />} label="Dashboard" active />
          <NavItem icon={<Users size={18} />} label="User Management" />
          <NavItem icon={<Activity size={18} />} label="Event Monitoring" />
          <NavItem icon={<BarChart3 size={18} />} label="Analytics" />
          <NavItem icon={<Wallet size={18} />} label="Revenue" />

          <div className="mt-8 mb-2 px-3 text-xs font-semibold text-slate-500 tracking-wider">SYSTEM CONTROL</div>
          <NavItem icon={<Shield size={18} />} label="RBAC Settings" />
          <NavItem icon={<SettingsIcon size={18} />} label="Settings" />
        </div>

        <div className="p-4 border-t border-slate-800 space-y-3">
          <div className="bg-slate-800/50 rounded-lg p-3 text-xs">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
              <span className="text-slate-200 font-medium uppercase tracking-wider">Server Status</span>
            </div>
            <div className="text-slate-500 truncate mt-1">Operational: AWS-US-EAST-1</div>
          </div>
          
          <div className="bg-indigo-600/20 border border-indigo-500/30 rounded-lg p-3 flex items-center gap-3">
            <Shield className="text-indigo-400" size={18} />
            <div className="text-xs">
              <div className="text-indigo-300 font-semibold uppercase tracking-wider">Security Mode</div>
              <div className="text-slate-400">Role-Based Access Active</div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 flex-shrink-0">
          <div className="max-w-md w-full relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search events, users, or transactions..." 
              className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            />
          </div>

          <div className="flex items-center gap-6">
            <div className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1.5 border border-indigo-100">
              <Shield size={14} />
              Super Admin
            </div>
            
            <button className="relative text-slate-400 hover:text-slate-600 transition-colors">
              <Bell size={20} />
              <span className="absolute top-0 right-0 w-2 h-2 bg-rose-500 rounded-full border border-white"></span>
            </button>

            <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
              <div className="text-right flex flex-col justify-center">
                <span className="text-sm font-semibold leading-tight">Alexander Thorne</span>
                <span className="text-xs text-slate-500 font-medium">alex.thorne@eventhub.com</span>
              </div>
              <div className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-sm border-2 border-white ring-2 ring-indigo-50">
                AT
              </div>
            </div>
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto w-full">
          <div className="p-8 max-w-7xl mx-auto space-y-6">
            {/* Page Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">System Dashboard</h1>
                <p className="text-slate-500 text-sm mt-1 font-medium">Real-time overview of platform health and performance.</p>
              </div>
              <div className="flex items-center gap-3">
                <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-all shadow-sm">
                  <Download size={16} />
                  Export Data
                </button>
                <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 rounded-lg text-sm font-medium text-white hover:bg-indigo-700 transition-all shadow-sm shadow-indigo-200">
                  <Plus size={16} />
                  New Event
                </button>
              </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
              <StatCard 
                title="Total Revenue" 
                value="$248,590.00" 
                trend="+12.4%" 
                trendText="vs last month"
                icon={<div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl"><Wallet size={20} /></div>}
                trendUp={true}
              />
              <StatCard 
                title="Active Events" 
                value="124" 
                trend="+8.2%" 
                trendText="vs last month"
                icon={<div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl"><Activity size={20} /></div>}
                trendUp={true}
              />
              <StatCard 
                title="Total Users" 
                value="12,458" 
                trend="+24.1%" 
                trendText="vs last month"
                icon={<div className="p-3 bg-blue-50 text-blue-600 rounded-xl"><Users size={20} /></div>}
                trendUp={true}
              />
              <StatCard 
                title="System Uptime" 
                value="99.98%" 
                trend="Active" 
                trendText="Global Cluster"
                icon={<div className="p-3 bg-slate-100 text-slate-600 rounded-xl"><Activity size={20} /></div>}
                trendUp={null}
              />
            </div>

            {/* Middle Section: Chart & Activity */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              {/* Chart Card */}
              <div className="xl:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h2 className="text-base font-semibold text-slate-900">User Growth</h2>
                    <p className="text-sm text-slate-500 font-medium">Daily registration statistics for current month</p>
                  </div>
                  <button className="flex items-center gap-2 text-sm font-medium text-slate-600 bg-slate-50 hover:bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200 transition-colors">
                    Last 30 days <ChevronDown size={14} />
                  </button>
                </div>
                <div className="h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2}/>
                          <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis 
                        dataKey="name" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fill: '#94a3b8', fontSize: 12 }}
                        dy={10}
                      />
                      <YAxis 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fill: '#94a3b8', fontSize: 12 }}
                      />
                      <Tooltip 
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' }}
                      />
                      <Area type="monotone" dataKey="users" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#colorUsers)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 flex flex-col">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-base font-semibold text-slate-900">Recent Activity</h2>
                  <button className="text-indigo-600 text-sm font-semibold hover:text-indigo-700">View all</button>
                </div>
                
                <div className="flex-1 flex flex-col gap-5">
                  <ActivityItem 
                    icon={<div className="p-2 bg-indigo-50 text-indigo-600 rounded-full"><Wallet size={16} /></div>}
                    title={<span><span className="font-semibold text-indigo-600">Sarah J.</span> purchased 4 VIP tickets</span>}
                    subtitle="Jazz Festival 2024 • 2 mins ago"
                  />
                  <ActivityItem 
                    icon={<div className="p-2 bg-emerald-50 text-emerald-600 rounded-full"><Plus size={16} /></div>}
                    title={<span><span className="font-semibold text-emerald-600">Nova Events</span> listed a new event</span>}
                    subtitle="Tech Summit Q4 • 15 mins ago"
                  />
                  <ActivityItem 
                    icon={<div className="p-2 bg-amber-50 text-amber-600 rounded-full"><Activity size={16} /></div>}
                    title={<span><span className="font-semibold text-amber-600">Withdrawal Request</span> of $12,400.00</span>}
                    subtitle="Pending approval • 42 mins ago"
                  />
                  <ActivityItem 
                    icon={<div className="p-2 bg-blue-50 text-blue-600 rounded-full"><Users size={16} /></div>}
                    title={<span><span className="font-semibold text-blue-600">Michael R.</span> registered as Organizer</span>}
                    subtitle="Account verified • 1 hour ago"
                  />
                </div>
              </div>
            </div>

            {/* Users Table */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-200">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-base font-semibold text-slate-900">User Management</h2>
                    <p className="text-sm text-slate-500 font-medium">Monitor and manage access controls</p>
                  </div>
                  <div className="flex gap-2">
                    <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"><Search size={18} /></button>
                    <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"><MoreVertical size={18} /></button>
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200">
                      <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">User Profile</th>
                      <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Role</th>
                      <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Join Date</th>
                      <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Bookings</th>
                      <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    <UserRow 
                      initials="EJ" 
                      name="Emma Johnson" 
                      email="emma.j@gmail.com" 
                      role="Customer" 
                      joinDate="Oct 12, 2023" 
                      bookings="12 Bookings" 
                      status="Active" 
                    />
                    <UserRow 
                      initials="LM" 
                      name="Lucas Miller" 
                      email="l.miller@stellar.io" 
                      role="Organizer" 
                      roleColor="text-indigo-700 bg-indigo-50 border-indigo-100"
                      joinDate="Nov 04, 2023" 
                      bookings="45 Events" 
                      status="Active" 
                    />
                    <UserRow 
                      initials="SP" 
                      name="Sophia Parker" 
                      email="sophia.p@hotmail.com" 
                      role="Customer" 
                      joinDate="Dec 15, 2023" 
                      bookings="2 Bookings" 
                      status="Blocked" 
                    />
                    <UserRow 
                      initials="DB" 
                      name="David Brown" 
                      email="dbrown@techmedia.com" 
                      role="Customer" 
                      joinDate="Jan 02, 2024" 
                      bookings="0 Bookings" 
                      status="Unverified" 
                    />
                  </tbody>
                </table>
              </div>
              
              <div className="p-4 border-t border-slate-200 flex items-center justify-between text-sm">
                <span className="text-slate-500 font-medium">Showing 1 to 4 of 1,240 users</span>
                <div className="flex items-center gap-1">
                  <button className="px-3 py-1 border border-slate-200 rounded text-slate-600 hover:bg-slate-50 font-medium">Previous</button>
                  <button className="w-8 h-8 flex items-center justify-center bg-indigo-600 text-white rounded font-medium">1</button>
                  <button className="w-8 h-8 flex items-center justify-center hover:bg-slate-50 text-slate-600 rounded font-medium">2</button>
                  <button className="w-8 h-8 flex items-center justify-center hover:bg-slate-50 text-slate-600 rounded font-medium">3</button>
                  <span className="text-slate-400 px-1">...</span>
                  <button className="w-8 h-8 flex items-center justify-center hover:bg-slate-50 text-slate-600 rounded font-medium">310</button>
                  <button className="px-3 py-1 border border-slate-200 rounded text-slate-600 hover:bg-slate-50 font-medium">Next</button>
                </div>
              </div>
            </div>
            
            <div className="h-8"></div> {/* Bottom padding */}
          </div>
        </div>
      </main>
    </div>
  );
};

// Sub-components

function NavItem({ icon, label, active = false }: { icon: React.ReactNode, label: string, active?: boolean }) {
  return (
    <button className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
      active 
        ? 'bg-indigo-600 text-white shadow-sm' 
        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
    }`}>
      {icon}
      {label}
    </button>
  );
}

function StatCard({ title, value, trend, trendText, icon, trendUp }: any) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 flex flex-col justify-between">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-sm font-semibold text-slate-500 mb-1">{title}</h3>
          <p className="text-2xl font-bold text-slate-900 tracking-tight">{value}</p>
        </div>
        {icon}
      </div>
      <div className="flex items-center gap-2 mt-auto">
        {trendUp === true && (
          <span className="flex items-center text-xs font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded gap-0.5">
            <TrendingUp size={12} /> {trend}
          </span>
        )}
        {trendUp === false && (
          <span className="flex items-center text-xs font-semibold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded gap-0.5">
            <TrendingUp size={12} className="rotate-180" /> {trend}
          </span>
        )}
        {trendUp === null && (
          <span className="text-xs font-semibold text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded">
            {trend}
          </span>
        )}
        <span className="text-xs text-slate-500 font-medium">{trendText}</span>
      </div>
    </div>
  );
}

function ActivityItem({ icon, title, subtitle }: any) {
  return (
    <div className="flex gap-4">
      <div className="mt-0.5">{icon}</div>
      <div>
        <p className="text-sm text-slate-800 font-medium">{title}</p>
        <p className="text-xs text-slate-500 font-medium mt-0.5">{subtitle}</p>
      </div>
    </div>
  );
}

function UserRow({ initials, name, email, role, roleColor, joinDate, bookings, status }: any) {
  return (
    <tr className="hover:bg-slate-50 transition-colors group">
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-slate-100 text-slate-600 font-bold flex items-center justify-center text-xs border border-slate-200">
            {initials}
          </div>
          <div>
            <div className="text-sm font-semibold text-slate-900">{name}</div>
            <div className="text-xs text-slate-500 font-medium">{email}</div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4">
        <span className={`px-2.5 py-1 rounded-md text-xs font-semibold border ${roleColor || 'bg-slate-100 text-slate-700 border-slate-200'}`}>
          <div className="flex items-center gap-1.5">
            <Users size={12} /> {role}
          </div>
        </span>
      </td>
      <td className="px-6 py-4 text-sm text-slate-600 font-medium">
        {joinDate}
      </td>
      <td className="px-6 py-4 text-sm text-slate-900 font-semibold">
        {bookings}
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${
            status === 'Active' ? 'bg-emerald-500' : 
            status === 'Blocked' ? 'bg-rose-500' : 'bg-amber-400'
          }`}></div>
          <span className={`text-xs font-semibold ${
            status === 'Active' ? 'text-emerald-700' : 
            status === 'Blocked' ? 'text-rose-700' : 'text-amber-700'
          }`}>{status}</span>
        </div>
      </td>
      <td className="px-6 py-4 text-right">
        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors tooltip" aria-label="View Details">
            <Eye size={16} />
          </button>
          <button className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors" aria-label="Block User">
            <Ban size={16} />
          </button>
        </div>
      </td>
    </tr>
  );
}

export default AdminDashboard;
