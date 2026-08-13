import React, { useEffect, useState } from 'react';
import { Users, TrendingUp, Globe, RefreshCw } from 'lucide-react';
import { collection, onSnapshot, query, orderBy, limit } from 'firebase/firestore';
import { db } from '../../../config/firebase';

interface VisitorRecord {
  ip: string;
  visitCount: number;
  lastVisit: any;
  browserInfo?: {
    userAgent: string;
    language: string;
    platform: string;
  };
}

interface AnalyticsStats {
  totalVisits: number;
  lastUpdated: any;
}

export const VisitorAnalytics: React.FC = () => {
  const [visitors, setVisitors] = useState<VisitorRecord[]>([]);
  const [stats, setStats] = useState<AnalyticsStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);

    // Listen to visitors collection
    const visitorsQuery = query(
      collection(db, 'visitors'),
      orderBy('lastVisit', 'desc'),
      limit(100)
    );
    const unsubVisitors = onSnapshot(visitorsQuery, (snapshot) => {
      const visitorData: VisitorRecord[] = [];
      snapshot.forEach((doc) => {
        visitorData.push({ ip: doc.id, ...doc.data() } as VisitorRecord);
      });
      setVisitors(visitorData);
      setLoading(false);
    });

    // Listen to analytics stats
    const unsubStats = onSnapshot(collection(db, 'analytics'), (snapshot) => {
      snapshot.forEach((doc) => {
        if (doc.id === 'stats') {
          setStats(doc.data() as AnalyticsStats);
        }
      });
    });

    return () => {
      unsubVisitors();
      unsubStats();
    };
  }, []);

  const uniqueVisitors = visitors.length;
  const totalVisits = stats?.totalVisits || 0;
  const avgVisitsPerIP = uniqueVisitors > 0 ? (totalVisits / uniqueVisitors).toFixed(1) : '0';

  const formatTimestamp = (timestamp: any) => {
    if (!timestamp) return 'N/A';
    try {
      const date = timestamp.toDate?.() || new Date(timestamp);
      return date.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return 'Invalid Date';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="w-8 h-8 text-blue-500 animate-spin" />
          <span className="text-sm font-semibold text-gray-600">Loading visitor analytics...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-black/8">
        <div>
          <h3 className="font-serif-cormorant font-bold text-2xl sm:text-3xl text-[#111111] flex items-center gap-2">
            <Globe className="w-7 h-7 text-blue-500" />
            Visitor Analytics
          </h3>
          <p className="font-sans-manrope text-xs text-[#5F5F5F] mt-1">
            Real-time visitor tracking with IP addresses and visit counts. Developer-only view.
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-5 text-white shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold opacity-90 uppercase tracking-wider">Total Visits</span>
            <TrendingUp className="w-5 h-5 opacity-80" />
          </div>
          <div className="font-serif-cormorant font-bold text-4xl">{totalVisits.toLocaleString()}</div>
          <span className="text-xs opacity-80 mt-1 block">All page views</span>
        </div>

        <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl p-5 text-white shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold opacity-90 uppercase tracking-wider">Unique IPs</span>
            <Users className="w-5 h-5 opacity-80" />
          </div>
          <div className="font-serif-cormorant font-bold text-4xl">{uniqueVisitors.toLocaleString()}</div>
          <span className="text-xs opacity-80 mt-1 block">Different visitors</span>
        </div>

        <div className="bg-gradient-to-br from-violet-500 to-violet-600 rounded-2xl p-5 text-white shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold opacity-90 uppercase tracking-wider">Avg Visits/IP</span>
            <Globe className="w-5 h-5 opacity-80" />
          </div>
          <div className="font-serif-cormorant font-bold text-4xl">{avgVisitsPerIP}</div>
          <span className="text-xs opacity-80 mt-1 block">Return rate</span>
        </div>
      </div>

      {/* Visitors Table */}
      <div className="bg-white rounded-2xl border border-black/8 shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-black/8">
          <h4 className="font-sans-manrope font-bold text-sm text-[#111111] uppercase tracking-wider">
            Recent Visitors (Last 100)
          </h4>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-black/8">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-extrabold text-gray-600 uppercase tracking-wider">
                  IP Address
                </th>
                <th className="px-6 py-3 text-left text-xs font-extrabold text-gray-600 uppercase tracking-wider">
                  Visit Count
                </th>
                <th className="px-6 py-3 text-left text-xs font-extrabold text-gray-600 uppercase tracking-wider">
                  Last Visit
                </th>
                <th className="px-6 py-3 text-left text-xs font-extrabold text-gray-600 uppercase tracking-wider">
                  Platform
                </th>
                <th className="px-6 py-3 text-left text-xs font-extrabold text-gray-600 uppercase tracking-wider">
                  Language
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {visitors.length > 0 ? (
                visitors.map((visitor) => (
                  <tr key={visitor.ip} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm font-mono text-[#111111] font-semibold">
                      {visitor.ip}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-bold">
                        {visitor.visitCount} visit{visitor.visitCount !== 1 ? 's' : ''}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 font-medium">
                      {formatTimestamp(visitor.lastVisit)}
                    </td>
                    <td className="px-6 py-4 text-xs text-gray-500 font-medium">
                      {visitor.browserInfo?.platform || 'Unknown'}
                    </td>
                    <td className="px-6 py-4 text-xs text-gray-500 font-medium">
                      {visitor.browserInfo?.language || 'Unknown'}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-sm text-gray-500">
                    No visitor data yet. Visitors will appear here automatically.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Last Updated */}
      {stats?.lastUpdated && (
        <div className="text-center text-xs text-gray-500 font-medium">
          Last updated: {formatTimestamp(stats.lastUpdated)}
        </div>
      )}
    </div>
  );
};
