import React, { useState, useEffect } from 'react';

export default function NovaReachApp() {
  const [currentUser, setCurrentUser] = useState(null);
  const [currentMode, setCurrentMode] = useState('user');
  const [users, setUsers] = useState({
    hudair: {
      id: 'hudair',
      password: 'hudair123!',
      email: 'hudairminai01@gmail.com',
      company: 'BE FORWARD Japan',
      messageTemplate: 'Hello [YourName] from BE FORWARD Japan',
      emailTemplate: 'Subject: Japanese Vehicles\n\nHello [DealerName]'
    }
  });
  const [campaignHistory, setCampaignHistory] = useState({});
  const [dailyMessageCount, setDailyMessageCount] = useState({});

  useEffect(() => {
    const saved = localStorage.getItem('novareach_data');
    if (saved) {
      const data = JSON.parse(saved);
      if (data.users) setUsers(data.users);
      if (data.campaigns) setCampaignHistory(data.campaigns);
      if (data.daily) setDailyMessageCount(data.daily);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('novareach_data', JSON.stringify({ users, campaignHistory, dailyMessageCount }));
  }, [users, campaignHistory, dailyMessageCount]);

  const handleLogin = (username, password) => {
    if (!users[username] || users[username].password !== password) return false;
    setCurrentUser(username);
    setCurrentMode('user');
    return true;
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentMode('user');
  };

  const getDailyUsage = (username) => {
    const today = new Date().toDateString();
    const count = dailyMessageCount[username];
    if (!count || count.date !== today) return { sent: 0, remaining: 100 };
    return { sent: count.count, remaining: Math.max(0, 100 - count.count) };
  };

  if (!currentUser) return <LoginPage users={users} onLogin={handleLogin} />;

  if (currentMode === 'admin' && currentUser === 'hudair') {
    return <AdminDashboard currentUser={currentUser} users={users} onLogout={handleLogout} onSwitchMode={() => setCurrentMode('user')} setUsers={setUsers} campaignHistory={campaignHistory} />;
  }

  return <UserDashboard currentUser={currentUser} user={users[currentUser]} onLogout={handleLogout} onSwitchToAdmin={() => setCurrentMode('admin')} dailyUsage={getDailyUsage(currentUser)} campaignHistory={campaignHistory[currentUser] || []} onSaveCampaign={(campaign) => { if (!campaignHistory[currentUser]) campaignHistory[currentUser] = []; setCampaignHistory({ ...campaignHistory, [currentUser]: [...campaignHistory[currentUser], campaign] }); }} />;
}

function LoginPage({ users, onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleClick = () => {
    if (!username || !password) { setError('Enter both fields'); return; }
    if (onLogin(username, password)) { setError(''); } else { setError('Invalid credentials'); }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', padding: '20px', fontFamily: 'Segoe UI, sans-serif' }}>
      <div style={{ background: 'white', borderRadius: '15px', padding: '50px 40px', boxShadow: '0 20px 60px rgba(0,0,0,0.3)', maxWidth: '420px', width: '100%' }}>
        <h1 style={{ color: '#667eea', textAlign: 'center', marginBottom: '40px' }}>Nova Reach</h1>
        <input type="text" placeholder="Username" value={username} onChange={(e) => { setUsername(e.target.value); setError(''); }} style={{ width: '100%', padding: '12px', marginBottom: '15px', border: '2px solid #e0e0e0', borderRadius: '8px', boxSizing: 'border-box', fontSize: '14px' }} />
        <input type="password" placeholder="Password" value={password} onChange={(e) => { setPassword(e.target.value); setError(''); }} style={{ width: '100%', padding: '12px', marginBottom: '15px', border: '2px solid #e0e0e0', borderRadius: '8px', boxSizing: 'border-box', fontSize: '14px' }} />
        {error && <p style={{ color: '#e74c3c', marginBottom: '15px', fontSize: '12px' }}>{error}</p>}
        <button onClick={handleClick} style={{ width: '100%', padding: '12px', background: '#667eea', color: 'white', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: '600', cursor: 'pointer' }}>Login</button>
      </div>
    </div>
  );
}

function AdminDashboard({ currentUser, users, onLogout, onSwitchMode, setUsers, campaignHistory }) {
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ username: '', password: '', email: '', company: 'BE FORWARD Japan' });

  const handleCreate = () => {
    if (!form.username || !form.password || !form.email) { alert('Fill all fields'); return; }
    if (users[form.username]) { alert('User exists'); return; }
    setUsers({ ...users, [form.username]: { id: form.username, password: form.password, email: form.email, company: form.company, messageTemplate: 'Hello [YourName]', emailTemplate: 'Subject: Hello\n\nHello [DealerName]' } });
    alert('User ' + form.username + ' created!');
    setForm({ username: '', password: '', email: '', company: 'BE FORWARD Japan' });
    setShowCreate(false);
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f5f7fa', fontFamily: 'Segoe UI, sans-serif' }}>
      <div style={{ background: 'white', padding: '20px 30px', borderBottom: '1px solid #e0e0e0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
        <h1 style={{ color: '#667eea', margin: '0' }}>Admin Panel</h1>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={onSwitchMode} style={{ padding: '10px 20px', background: '#667eea', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>Back to Campaigns</button>
          <button onClick={onLogout} style={{ padding: '10px 20px', background: '#e74c3c', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>Logout</button>
        </div>
      </div>
      <div style={{ padding: '30px', maxWidth: '1000px', margin: '0 auto' }}>
        <div style={{ background: 'white', padding: '30px', borderRadius: '10px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', marginBottom: '20px' }}>
          <h2 style={{ color: '#667eea', marginBottom: '20px' }}>Users</h2>
          {Object.entries(users).map(([name, data]) => (
            <div key={name} style={{ padding: '15px', background: '#f8f9fa', borderRadius: '8px', marginBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p style={{ margin: '0', fontWeight: '600', color: '#333' }}>{name}</p>
                <p style={{ margin: '5px 0', fontSize: '12px', color: '#666' }}>{data.email}</p>
              </div>
              <span style={{ color: '#27ae60', fontWeight: '600' }}>OK</span>
            </div>
          ))}
          <button onClick={() => setShowCreate(!showCreate)} style={{ marginTop: '15px', padding: '10px 20px', background: '#667eea', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: '600' }}>Create User</button>
        </div>

        {showCreate && (
          <div style={{ background: 'white', padding: '30px', borderRadius: '10px', marginBottom: '20px', border: '2px solid #667eea' }}>
            <h3 style={{ color: '#667eea', marginBottom: '15px' }}>Create New User</h3>
            <input type="text" placeholder="Username" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} style={{ width: '100%', padding: '10px', marginBottom: '15px', border: '2px solid #e0e0e0', borderRadius: '5px', boxSizing: 'border-box' }} />
            <input type="password" placeholder="Password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} style={{ width: '100%', padding: '10px', marginBottom: '15px', border: '2px solid #e0e0e0', borderRadius: '5px', boxSizing: 'border-box' }} />
            <input type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} style={{ width: '100%', padding: '10px', marginBottom: '15px', border: '2px solid #e0e0e0', borderRadius: '5px', boxSizing: 'border-box' }} />
            <button onClick={handleCreate} style={{ width: '100%', padding: '10px', background: '#27ae60', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: '600' }}>Create</button>
          </div>
        )}

        <div style={{ background: 'white', padding: '30px', borderRadius: '10px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
          <h2 style={{ color: '#667eea', marginBottom: '20px' }}>Analytics</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '15px' }}>
            <div style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', padding: '20px', borderRadius: '8px', textAlign: 'center', color: 'white' }}>
              <div style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '10px' }}>{Object.keys(users).length}</div>
              <div style={{ fontSize: '14px' }}>Users</div>
            </div>
            <div style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', padding: '20px', borderRadius: '8px', textAlign: 'center', color: 'white' }}>
              <div style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '10px' }}>{Object.values(campaignHistory).flat().reduce((sum, c) => sum + (c.dealerships ? c.dealerships.length : 0), 0)}</div>
              <div style={{ fontSize: '14px' }}>Messages</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function UserDashboard({ currentUser, user, onLogout, onSwitchToAdmin, dailyUsage, campaignHistory, onSaveCampaign }) {
  const [page, setPage] = useState('home');
  const [campaignType, setCampaignType] = useState('whatsapp');
  const [country, setCountry] = useState('');
  const [city, setCity] = useState('');
  const [dealers, setDealers] = useState([]);
  const [quantity, setQuantity] = useState(20);
  const [delay, setDelay] = useState(5);
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(false);
  const [msgTemplate, setMsgTemplate] = useState(user.messageTemplate);
  const [emailTemplate, setEmailTemplate] = useState(user.emailTemplate);

  const handleSearch = () => {
    if (!country || !city) { alert('Enter country and city'); return; }
    const mockDealers = [
      { id: 1, name: 'Inchcape', phone: '+1246417777', email: 'info@inchcape.com', address: city + ', ' + country },
      { id: 2, name: 'ANSA Motors', phone: '+1246467240', email: 'contact@ansam otors.com', address: city + ', ' + country },
      { id: 3, name: 'Courtesy Garage', phone: '+1246431100', email: 'info@courtesygarage.com', address: city + ', ' + country },
      { id: 4, name: 'DV Motors', phone: '+1246283666', email: 'sales@dvmotors.com', address: city + ', ' + country },
      { id: 5, name: 'Pioneer Motors', phone: '+1246622200', email: 'info@pioneermotors.com', address: city + ', ' + country }
    ];
    setDealers(mockDealers);
  };

  const handleSend = async () => {
    if (dealers.length === 0) { alert('Search first'); return; }
    if (quantity > dailyUsage.remaining) { alert('Only ' + dailyUsage.remaining + ' left today'); return; }
    setLoading(true);
    const selected = dealers.slice(0, quantity);
    const sent = [];
    for (let i = 0; i < selected.length; i++) {
      const d = selected[i];
      const template = campaignType === 'whatsapp' ? msgTemplate : emailTemplate;
      const msg = template.replace('[DealerName]', d.name).replace('[YourName]', currentUser).replace('[Company]', user.company);
      sent.push({ name: d.name, phone: d.phone, email: d.email, address: d.address, message: msg, channel: campaignType, status: 'Sent', timestamp: new Date().toISOString() });
      setProgress(Math.round(((i + 1) / selected.length) * 100));
      await new Promise(r => setTimeout(r, delay * 1000));
    }
    onSaveCampaign({ id: Date.now(), timestamp: new Date().toISOString(), country, city, quantity: selected.length, channel: campaignType, dealerships: sent });
    setLoading(false);
    setProgress(0);
    const csv = [['Name', 'Phone', 'Email', 'Address', 'Channel', 'Message', 'Status', 'Time'], ...sent.map(d => [d.name, d.phone, d.email, d.address, d.channel, d.message, d.status, d.timestamp])].map(row => row.map(cell => '"' + cell + '"').join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'nova-reach-' + Date.now() + '.csv';
    a.click();
    alert(campaignType + ' campaign sent!');
  };

  const handleCsvUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const lines = evt.target.result.split('\n');
      const dealers = [];
      for (let i = 1; i < lines.length; i++) {
        if (lines[i].trim() === '') continue;
        const vals = lines[i].split(',');
        dealers.push({ id: i, name: vals[0]?.trim() || '', phone: vals[1]?.trim() || '', email: vals[2]?.trim() || '', address: vals[3]?.trim() || '' });
      }
      setDealers(dealers);
      alert('CSV loaded: ' + dealers.length + ' dealers');
    };
    reader.readAsText(file);
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f5f7fa', fontFamily: 'Segoe UI, sans-serif' }}>
      <div style={{ background: 'white', padding: '20px 30px', borderBottom: '1px solid #e0e0e0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
        <h1 style={{ color: '#667eea', margin: '0' }}>Nova Reach</h1>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <span style={{ color: '#333', fontWeight: '600' }}>{currentUser}</span>
          {currentUser === 'hudair' && <button onClick={onSwitchToAdmin} style={{ padding: '10px 15px', background: '#667eea', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontSize: '12px' }}>Admin</button>}
          <button onClick={onLogout} style={{ padding: '10px 20px', background: '#e74c3c', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>Logout</button>
        </div>
      </div>
      <div style={{ padding: '30px', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ display: 'flex', gap: '10px', marginBottom: '30px', borderBottom: '1px solid #e0e0e0', paddingBottom: '15px' }}>
          <button onClick={() => setPage('home')} style={{ padding: '10px 20px', border: 'none', borderRadius: '5px', background: page === 'home' ? '#667eea' : '#e0e0e0', color: page === 'home' ? 'white' : 'black', cursor: 'pointer', fontWeight: '600' }}>Home</button>
          <button onClick={() => setPage('campaign')} style={{ padding: '10px 20px', border: 'none', borderRadius: '5px', background: page === 'campaign' ? '#667eea' : '#e0e0e0', color: page === 'campaign' ? 'white' : 'black', cursor: 'pointer', fontWeight: '600' }}>Campaign</button>
          <button onClick={() => setPage('history')} style={{ padding: '10px 20px', border: 'none', borderRadius: '5px', background: page === 'history' ? '#667eea' : '#e0e0e0', color: page === 'history' ? 'white' : 'black', cursor: 'pointer', fontWeight: '600' }}>History</button>
          <button onClick={() => setPage('settings')} style={{ padding: '10px 20px', border: 'none', borderRadius: '5px', background: page === 'settings' ? '#667eea' : '#e0e0e0', color: page === 'settings' ? 'white' : 'black', cursor: 'pointer', fontWeight: '600' }}>Settings</button>
        </div>

        <div style={{ background: 'white', padding: '30px', borderRadius: '10px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
          {page === 'home' && (
            <div>
              <h2 style={{ color: '#667eea', marginBottom: '20px' }}>Dashboard</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '15px' }}>
                <div style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', padding: '20px', borderRadius: '8px', textAlign: 'center', color: 'white' }}>
                  <div style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '10px' }}>{campaignHistory.length}</div>
                  <div style={{ fontSize: '14px' }}>Campaigns</div>
                </div>
                <div style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', padding: '20px', borderRadius: '8px', textAlign: 'center', color: 'white' }}>
                  <div style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '10px' }}>{campaignHistory.reduce((sum, c) => sum + c.dealerships.length, 0)}</div>
                  <div style={{ fontSize: '14px' }}>Messages</div>
                </div>
                <div style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', padding: '20px', borderRadius: '8px', textAlign: 'center', color: 'white' }}>
                  <div style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '10px' }}>{dailyUsage.sent} / 100</div>
                  <div style={{ fontSize: '14px' }}>Today</div>
                </div>
              </div>
            </div>
          )}

          {page === 'campaign' && (
            <div>
              <h2 style={{ color: '#667eea', marginBottom: '20px' }}>New Campaign</h2>
              <label style={{ display: 'block', marginBottom: '15px' }}>
                <span style={{ fontWeight: '600', display: 'block', marginBottom: '5px' }}>Channel</span>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button onClick={() => setCampaignType('whatsapp')} style={{ padding: '10px 20px', background: campaignType === 'whatsapp' ? '#667eea' : '#e0e0e0', color: campaignType === 'whatsapp' ? 'white' : 'black', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>WhatsApp</button>
                  <button onClick={() => setCampaignType('email')} style={{ padding: '10px 20px', background: campaignType === 'email' ? '#667eea' : '#e0e0e0', color: campaignType === 'email' ? 'white' : 'black', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>Email</button>
                </div>
              </label>
              <label style={{ display: 'block', marginBottom: '15px' }}>
                <span style={{ fontWeight: '600', display: 'block', marginBottom: '5px' }}>Country</span>
                <input type="text" placeholder="e.g., Barbados" value={country} onChange={(e) => setCountry(e.target.value)} style={{ width: '100%', padding: '10px', border: '2px solid #e0e0e0', borderRadius: '5px', boxSizing: 'border-box' }} />
              </label>
              <label style={{ display: 'block', marginBottom: '15px' }}>
                <span style={{ fontWeight: '600', display: 'block', marginBottom: '5px' }}>City</span>
                <input type="text" placeholder="e.g., Bridgetown" value={city} onChange={(e) => setCity(e.target.value)} style={{ width: '100%', padding: '10px', border: '2px solid #e0e0e0', borderRadius: '5px', boxSizing: 'border-box' }} />
              </label>
              <button onClick={handleSearch} style={{ padding: '10px 20px', background: '#667eea', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: '600' }}>Search</button>

              {dealers.length > 0 && (
                <div style={{ marginTop: '20px', padding: '15px', background: '#f0f4ff', borderRadius: '5px' }}>
                  <p style={{ color: '#667eea', fontWeight: '600', marginBottom: '15px' }}>Found {dealers.length} dealers</p>
              
