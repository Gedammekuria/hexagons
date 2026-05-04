import React, { useState, useEffect } from 'react';
import { getAdminLogs, terminateUser } from '../../../api/client';
import { useToast } from '../../../components/Toast';
import { Shield, RefreshCw, Clock, Globe, User, Info, Search, ChevronLeft, Mail, Monitor, MapPin, Tag, PowerOff, X } from 'lucide-react';
import Modal from '../../../components/Modal';

const LogsManager = ({ token, admin }) => {
  const isViewer = admin?.role === 'viewer';
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [view, setView] = useState('list');
  const [selectedLog, setSelectedLog] = useState(null);
  const [terminating, setTerminating] = useState(false);
  const toast = useToast();

  const handleTerminate = async () => {
    if (!window.confirm(`Are you sure you want to terminate all active sessions for ${selectedLog.email}? They will be logged out immediately.`)) return;
    setTerminating(true);
    try {
      await terminateUser(token, selectedLog.email);
      toast.success(`Sessions for ${selectedLog.email} terminated successfully.`);
      load(); // Refresh logs to show the new terminate action
    } catch (err) {
      toast.error(err.message || 'Failed to terminate user.');
    } finally {
      setTerminating(false);
    }
  };

  const load = async () => {
    setLoading(true);
    try {
      const data = await getAdminLogs(token);
      setLogs(data);
    } catch (err) {
      console.error('Failed to load logs', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filteredLogs = logs.filter(l => 
    l.email.toLowerCase().includes(search.toLowerCase()) ||
    l.action.toLowerCase().includes(search.toLowerCase()) ||
    (l.location && l.location.toLowerCase().includes(search.toLowerCase())) ||
    l.ip_address.toLowerCase().includes(search.toLowerCase())
  );

  const fmtDate = (d) => new Date(d).toLocaleString('en-ET', { 
    dateStyle: 'medium', 
    timeStyle: 'short' 
  });

  return (
    <div className="admin-content" style={{ padding: '2rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Detail Modal */}
      {view === 'detail' && selectedLog && (
        <Modal 
          onClose={() => { setView('list'); setSelectedLog(null); }} 
          title="Security Log Details"
          maxWidth="800px"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: '#f8fafc', padding: '1.25rem', borderRadius: '0.75rem', border: '1px solid #e2e8f0' }}>
              <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'rgba(0,179,122,0.1)', color: '#00b37a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', fontWeight: 800 }}>{selectedLog.email[0].toUpperCase()}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 800, fontSize: '1.2rem' }}>{selectedLog.email}</div>
                <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{fmtDate(selectedLog.created_at)}</div>
              </div>
              <div style={{ padding: '0.35rem 0.75rem', background: 'rgba(59,130,246,0.1)', color: '#3b82f6', borderRadius: '0.5rem', fontWeight: 700, fontSize: '0.8rem' }}>{selectedLog.action}</div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.25rem' }}>
              <div style={{ border: '1px solid #e5e7eb', borderRadius: '0.75rem', padding: '1.25rem' }}>
                <h4 style={{ margin: '0 0 1rem', fontSize: '0.8rem', textTransform: 'uppercase', color: '#94a3b8', letterSpacing: '0.05em' }}>Location & IP</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}><Globe size={16} color="#64748b"/><span>{selectedLog.location || 'Unknown'}</span></div>
                  <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}><Shield size={16} color="#64748b"/><span>{selectedLog.ip_address}</span></div>
                </div>
              </div>
              <div style={{ border: '1px solid #e5e7eb', borderRadius: '0.75rem', padding: '1.25rem' }}>
                <h4 style={{ margin: '0 0 1rem', fontSize: '0.8rem', textTransform: 'uppercase', color: '#94a3b8', letterSpacing: '0.05em' }}>Device Info</h4>
                <div style={{ fontSize: '0.85rem', color: '#475569', lineHeight: 1.6, padding: '0.75rem', background: '#f8fafc', borderRadius: '0.5rem' }}>{selectedLog.user_agent || 'Unknown'}</div>
              </div>
            </div>

            {!isViewer && (
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #e5e7eb' }}>
                <button 
                  onClick={handleTerminate} 
                  disabled={terminating}
                  style={{ background: '#fee2e2', border: 'none', color: '#ef4444', padding: '0.6rem 1.2rem', borderRadius: '0.5rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                >
                  <PowerOff size={16}/> {terminating ? 'Terminating...' : 'Terminate Sessions'}
                </button>
              </div>
            )}
          </div>
        </Modal>
      )}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ color: '#111827', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Shield size={24} color="#00b37a"/> Security Logs
          </h2>
          <p style={{ color: '#64748b', margin: '0.25rem 0 0', fontSize: '0.85rem' }}>Track all administrative login activities and locations.</p>
        </div>
        <button onClick={load} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '0.5rem', color: '#64748b', padding: '0.5rem 1rem', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600 }}>
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''}/> Refresh Logs
        </button>
      </div>

      <div style={{ position: 'relative' }}>
        <Search size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}/>
        <input 
          value={search} 
          onChange={e => setSearch(e.target.value)} 
          placeholder="Filter logs by email, action, IP or location..." 
          style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.75rem', borderRadius: '0.75rem', border: '1px solid #e2e8f0', outline: 'none', fontSize: '0.9rem' }}
        />
      </div>

      {loading && logs.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: '#64748b' }}>Loading security logs...</div>
      ) : filteredLogs.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem', background: '#ffffff', borderRadius: '1rem', border: '1px dashed #e2e8f0', color: '#64748b' }}>
          No logs found matching your search.
        </div>
      ) : (
        <div style={{ background: '#ffffff', borderRadius: '1rem', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                {['User / Email', 'Action', 'Timestamp', 'Location / IP', 'Device'].map(h => (
                  <th key={h} style={{ padding: '1rem', fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredLogs.map((log) => (
                <tr 
                  key={log.id} 
                  onClick={() => { setSelectedLog(log); setView('detail'); }}
                  style={{ borderBottom: '1px solid #f1f5f9', transition: 'background 0.2s', cursor: 'pointer' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <td style={{ padding: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(0,179,122,0.1)', color: '#00b37a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', fontWeight: 700 }}>
                        {log.email[0].toUpperCase()}
                      </div>
                      <span style={{ fontWeight: 600, color: '#111827', fontSize: '0.9rem' }}>{log.email}</span>
                    </div>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{ padding: '0.25rem 0.6rem', borderRadius: '999px', background: 'rgba(59,130,246,0.1)', color: '#3b82f6', fontSize: '0.75rem', fontWeight: 700 }}>
                      {log.action}
                    </span>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#64748b', fontSize: '0.85rem' }}>
                      <Clock size={14}/> {fmtDate(log.created_at)}
                    </div>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#334155', fontSize: '0.85rem', fontWeight: 500 }}>
                        <Globe size={14} color="#00b37a"/> {log.location || 'Unknown'}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginLeft: '1.25rem' }}>{log.ip_address}</div>
                    </div>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '0.75rem', color: '#94a3b8' }} title={log.user_agent}>
                      {log.user_agent}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default LogsManager;
