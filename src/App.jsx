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
      messageTemplate: 'Hello [YourName] from BE FORWARD Japan.\n\nWe supply Japanese vehicles directly to dealerships and importers worldwide.\n\nWould you be interested in receiving our latest inventory and pricing?\n\nThank you.',
      emailTemplate: 'Subject: Japanese Vehicles Available\n\nHello [DealerName],\n\nThis is [YourName] from BE FORWARD Japan.\n\nWe supply Japanese vehicles directly to dealerships and importers worldwide.\n\nWould you be interested in receiving our latest inventory and pricing?\n\nBest regards,\n[YourName]'
    }
  });
  const [campaignHistory, setCampaignHistory] = useState({});
  const [dailyMessageCount, setDailyMessageCount] = useState({});

  useEffect(() => {
    const saved = localStorage.getItem('novareach_data');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        if (data.users) setUsers(data.users);
        if (data.campaigns) setCampaignHistory(data.campaigns);
        if (data.daily) setDailyMessageCount(data.daily);
      } catch (e) {
        console.log('Storage error');
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('novareach_data', JSON.stringify({
      users,
      campaigns: campaignHistory,
      daily: dailyMessageCount
    }));
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

  if (!currentUser) {
    return <LoginPage onLogin={handleLogin} />;
  }

  if (currentMode === 'admin' && currentUser === 'hudair') {
    return (
      <AdminDashboard
        users={users}
        setUsers={setUsers}
        onLogout={handleLogout}
        onSwitchMode={() => setCurrentMode('user')}
        campaignHistory={campaignHistory}
      />
    );
  }

  return (
    <UserDashboard
      currentUser={currentUser}
      user={users[currentUser]}
      onLogout={handleLogout}
      onSwitchToAdmin={() => setCurrentMode('admin')}
      dailyUsage={getDailyUsage(currentUser)}
      campaignHistory={campaignHistory[currentUser] || []}
      onSaveCampaign={(campaign) => {
        if (!campaignHistory[currentUser]) campaignHistory[currentUser] = [];
        setCampaignHistory({
          ...campaignHistory,
          [currentUser]: [...campaignHistory[currentUser], campaign]
        });
        const today = new Date().toDateString();
        const count = dailyMessageCount[currentUser] || { date: today, count: 0 };
        if (count.date !== today) count.date = today;
        count.count += campaign.dealerships.length;
        setDailyMessageCount({ ...dailyMessageCount, [currentUser]: count });
      }}
    />
  );
}

function LoginPage({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = () => {
    if (!username || !password) {
      setError('Please enter username and password');
      return;
    }
    if (onLogin(username, password)) {
      setError('');
    } else {
      setError('Invalid credentials');
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', padding: '20px', fontFamily: 'Segoe UI, sans-serif' }}>
      <div style={{ background: 'white', borderRadius: '15px', padding: '50px 40px', boxShadow: '0 20px 60px rgba(0,0,0,0.3)', maxWidth: '420px', width: '100%' }}>
        <h1 style={{ color: '#667eea', textAlign: 'center', marginBottom: '30px', fontSize: '32px' }}>Nova Reach</h1>
        <p style={{ textAlign: 'center', color: '#666', marginBottom: '30px', fontSize: '14px' }}>Multi-Channel Cold Outreach Platform</p>

        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => { setUsername(e.target.value); setError(''); }}
          onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
          style={{ width: '100%', padding: '12px', marginBottom: '15px', border: '2px solid #e0e0e0', borderRadius: '8px', boxSizing: 'border-box', fontSize: '14px' }}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => { setPassword(e.target.value); setError(''); }}
          onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
          style={{ width: '100%', padding: '12px', marginBottom: '15px', border: '2px solid #e0e0e0', borderRadius: '8px', boxSizing: 'border-box', fontSize: '14px' }}
        />

        {error && (
          <p style={{ color: '#e74c3c', marginBottom: '15px', fontSize: '12px', padding: '10px', background: '#fff5f5', borderRadius: '5px' }}>
            {error}
          </p>
        )}

        <button
          onClick={handleSubmit}
          style={{ width: '100%', padding: '12px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: '600', cursor: 'pointer' }}
        >
          Login
        </button>
      </div>
    </div>
  );
}

function AdminDashboard({ users, setUsers, onLogout, onSwitchMode, campaignHistory }) {
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ username: '', password: '', email: '', company: 'BE FORWARD Japan' });
  const [error, setError] = useState('');

  const handleCreate = () => {
    if (!form.username || !form.password || !form.email) {
      setError('Fill all fields');
      return;
    }
    if (users[form.username]) {
      setError('User already exists');
      return;
    }
    setUsers({
      ...users,
      [form.username]: {
        id: form.username,
        password: form.password,
        email: form.email,
        company: form.company,
        messageTemplate: 'Hello [YourName] from ' + form.company,
        emailTemplate: 'Subject: Hello\n\nHello [DealerName]'
      }
    });
    setError('');
    alert('User ' + form.username + ' created successfully!');
    setForm({ username: '', password: '', email: '', company: 'BE FORWARD Japan' });
    setShowCreate(false);
  };

  const totalMessages = Object.values(campaignHistory).flat().reduce((sum, c) => sum + (c.dealerships ? c.dealerships.length : 0), 0);

  return (
    <div style={{ minHeight: '100vh', background: '#f5f7fa', fontFamily: 'Segoe UI, sans-serif' }}>
      <div style={{ background: 'white', padding: '20px 30px', borderBottom: '1px solid #e0e0e0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
        <h1 style={{ color: '#667eea', margin: '0', fontSize: '24px' }}>Admin Panel</h1>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={onSwitchMode} style={{ padding: '10px 20px', background: '#667eea', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: '600' }}>Back to Campaigns</button>
          <button onClick={onLogout} style={{ padding: '10px 20px', background: '#e74c3c', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: '600' }}>Logout</button>
        </div>
      </div>

      <div style={{ padding: '30px', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '30px' }}>
          <div style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', padding: '25px', borderRadius: '10px', color: 'white', boxShadow: '0 5px 15px rgba(0,0,0,0.1)' }}>
            <div style={{ fontSize: '36px', fontWeight: 'bold', marginBottom: '10px' }}>{Object.keys(users).length}</div>
            <div style={{ fontSize: '16px' }}>Total Users</div>
          </div>
          <div style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', padding: '25px', borderRadius: '10px', color: 'white', boxShadow: '0 5px 15px rgba(0,0,0,0.1)' }}>
            <div style={{ fontSize: '36px', fontWeight: 'bold', marginBottom: '10px' }}>{totalMessages}</div>
            <div style={{ fontSize: '16px' }}>Total Messages Sent</div>
          </div>
          <div style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', padding: '25px', borderRadius: '10px', color: 'white', boxShadow: '0 5px 15px rgba(0,0,0,0.1)' }}>
            <div style={{ fontSize: '36px', fontWeight: 'bold', marginBottom: '10px' }}>{Object.keys(campaignHistory).length}</div>
            <div style={{ fontSize: '16px' }}>Total Campaigns</div>
          </div>
        </div>

        <div style={{ background: 'white', padding: '30px', borderRadius: '10px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', marginBottom: '30px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ color: '#667eea', margin: '0' }}>Users</h2>
            <button onClick={() => setShowCreate(!showCreate)} style={{ padding: '10px 20px', background: '#667eea', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: '600' }}>+ Create User</button>
          </div>

          {Object.entries(users).map(([name, data]) => (
            <div key={name} style={{ padding: '15px', background: '#f8f9fa', borderRadius: '8px', marginBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderLeft: '4px solid #667eea' }}>
              <div>
                <p style={{ margin: '0', fontWeight: '600', color: '#333', fontSize: '14px' }}>{name}</p>
                <p style={{ margin: '5px 0', fontSize: '12px', color: '#666' }}>{data.email}</p>
                <p style={{ margin: '3px 0', fontSize: '11px', color: '#999' }}>{data.company}</p>
              </div>
              <span style={{ color: '#27ae60', fontWeight: '600', fontSize: '14px' }}>✓ Active</span>
            </div>
          ))}
        </div>

        {showCreate && (
          <div style={{ background: 'white', padding: '30px', borderRadius: '10px', border: '2px solid #667eea', marginBottom: '30px' }}>
            <h3 style={{ color: '#667eea', margin: '0 0 20px 0' }}>Create New User</h3>
            {error && <p style={{ color: '#e74c3c', fontSize: '12px', marginBottom: '15px' }}>{error}</p>}

            <input
              type="text"
              placeholder="Username"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              style={{ width: '100%', padding: '10px', marginBottom: '15px', border: '2px solid #e0e0e0', borderRadius: '5px', boxSizing: 'border-box', fontSize: '14px' }}
            />

            <input
              type="password"
              placeholder="Password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              style={{ width: '100%', padding: '10px', marginBottom: '15px', border: '2px solid #e0e0e0', borderRadius: '5px', boxSizing: 'border-box', fontSize: '14px' }}
            />

            <input
              type="email"
              placeholder="Email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              style={{ width: '100%', padding: '10px', marginBottom: '15px', border: '2px solid #e0e0e0', borderRadius: '5px', boxSizing: 'border-box', fontSize: '14px' }}
            />

            <input
              type="text"
              placeholder="Company Name"
              value={form.company}
              onChange={(e) => setForm({ ...form, company: e.target.value })}
              style={{ width: '100%', padding: '10px', marginBottom: '15px', border: '2px solid #e0e0e0', borderRadius: '5px', boxSizing: 'border-box', fontSize: '14px' }}
            />

            <button onClick={handleCreate} style={{ width: '100%', padding: '10px', background: '#27ae60', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: '600' }}>Create User</button>
          </div>
        )}
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

  const mockDealerships = [
    { id: 1, name: 'Inchcape Motors', phone: '+1246417777', email: 'info@inchcape.com', address: 'Bridgetown, Barbados' },
    { id: 2, name: 'ANSA Motors Ltd', phone: '+1246467240', email: 'contact@ansa.com', address: 'Bridgetown, Barbados' },
    { id: 3, name: 'Courtesy Garage', phone: '+1246431100', email: 'info@courtesy.com', address: 'Bridgetown, Barbados' },
    { id: 4, name: 'DV Motors', phone: '+1246283666', email: 'sales@dvmotors.com', address: 'Bridgetown, Barbados' },
    { id: 5, name: 'Pioneer Motors', phone: '+1246622200', email: 'info@pioneermotors.com', address: 'Bridgetown, Barbados' },
  ];

  const handleSearch = () => {
    if (!country || !city) {
      alert('Please enter country and city');
      return;
    }
    const results = mockDealerships.map(d => ({ ...d, address: city + ', ' + country }));
    setDealers(results);
  };

  const handleSend = async () => {
    if (dealers.length === 0) {
      alert('Please search for dealers first');
      return;
    }
    if (quantity > dailyUsage.remaining) {
      alert('You have only ' + dailyUsage.remaining + ' messages remaining today');
      return;
    }

    setLoading(true);
    const selected = dealers.slice(0, quantity);
    const sent = [];

    for (let i = 0; i < selected.length; i++) {
      const d = selected[i];
      const template = campaignType === 'whatsapp' ? msgTemplate : emailTemplate;
      const msg = template
        .replace('[DealerName]', d.name)
        .replace('[YourName]', currentUser)
        .replace('[Company]', user.company);

      sent.push({
        name: d.name,
        phone: d.phone,
        email: d.email,
        address: d.address,
        message: msg,
        channel: campaignType,
        status: 'Sent',
        timestamp: new Date().toISOString()
      });

      setProgress(Math.round(((i + 1) / selected.length) * 100));
      await new Promise(r => setTimeout(r, delay * 1000));
    }

    onSaveCampaign({
      id: Date.now(),
      timestamp: new Date().toISOString(),
      country,
      city,
      quantity: selected.length,
      channel: campaignType,
      dealerships: sent
    });

    setLoading(false);
    setProgress(0);

    const csv = [
      ['Name', 'Phone', 'Email', 'Address', 'Channel', 'Message', 'Status', 'Timestamp'],
      ...sent.map(d => [d.name, d.phone, d.email, d.address, d.channel, d.message, d.status, d.timestamp])
    ].map(row => row.map(cell => '"' + cell + '"').join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'nova-reach-' + campaignType + '-' + Date.now() + '.csv';
    a.click();

    alert('Campaign sent! CSV downloaded.');
    setDealers([]);
    setCountry('');
    setCity('');
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
        dealers.push({
          id: i,
          name: vals[0]?.trim() || '',
          phone: vals[1]?.trim() || '',
          email: vals[2]?.trim() || '',
          address: vals[3]?.trim() || ''
        });
      }

      setDealers(dealers);
      alert('CSV loaded successfully: ' + dealers.length + ' dealers');
    };

    reader.readAsText(file);
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f5f7fa', fontFamily: 'Segoe UI, sans-serif' }}>
      <div style={{ background: 'white', padding: '20px 30px', borderBottom: '1px solid #e0e0e0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
        <h1 style={{ color: '#667eea', margin: '0', fontSize: '24px' }}>Nova Reach</h1>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <span style={{ color: '#333', fontWeight: '600' }}>{currentUser}</span>
          {currentUser === 'hudair' && (
            <button onClick={onSwitchToAdmin} style={{ padding: '8px 15px', background: '#667eea', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }}>
              Admin
            </button>
          )}
          <button onClick={onLogout} style={{ padding: '10px 20px', background: '#e74c3c', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: '600' }}>
            Logout
          </button>
        </div>
      </div>

      <div style={{ padding: '30px', maxWidth: '1400px', margin: '0 auto' }}>
        <div style={{ display: 'flex', gap: '10px', marginBottom: '30px', borderBottom: '1px solid #e0e0e0', paddingBottom: '15px', overflowX: 'auto' }}>
          <button onClick={() => setPage('home')} style={{ padding: '10px 20px', border: 'none', borderRadius: '5px', background: page === 'home' ? '#667eea' : '#e0e0e0', color: page === 'home' ? 'white' : 'black', cursor: 'pointer', fontWeight: '600', whiteSpace: 'nowrap' }}>🏠 Home</button>
          <button onClick={() => setPage('campaign')} style={{ padding: '10px 20px', border: 'none', borderRadius: '5px', background: page === 'campaign' ? '#667eea' : '#e0e0e0', color: page === 'campaign' ? 'white' : 'black', cursor: 'pointer', fontWeight: '600', whiteSpace: 'nowrap' }}>📱 Campaign</button>
          <button onClick={() => setPage('history')} style={{ padding: '10px 20px', border: 'none', borderRadius: '5px', background: page === 'history' ? '#667eea' : '#e0e0e0', color: page === 'history' ? 'white' : 'black', cursor: 'pointer', fontWeight: '600', whiteSpace: 'nowrap' }}>📊 History</button>
          <button onClick={() => setPage('settings')} style={{ padding: '10px 20px', border: 'none', borderRadius: '5px', background: page === 'settings' ? '#667eea' : '#e0e0e0', color: page === 'settings' ? 'white' : 'black', cursor: 'pointer', fontWeight: '600', whiteSpace: 'nowrap' }}>⚙️ Settings</button>
        </div>

        {page === 'home' && (
          <div>
            <h2 style={{ color: '#667eea', marginBottom: '20px' }}>Dashboard</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '30px' }}>
              <div style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', padding: '25px', borderRadius: '10px', color: 'white', boxShadow: '0 5px 15px rgba(0,0,0,0.1)', textAlign: 'center' }}>
                <div style={{ fontSize: '36px', fontWeight: 'bold', marginBottom: '10px' }}>{campaignHistory.length}</div>
                <div style={{ fontSize: '16px' }}>Campaigns Sent</div>
              </div>
              <div style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', padding: '25px', borderRadius: '10px', color: 'white', boxShadow: '0 5px 15px rgba(0,0,0,0.1)', textAlign: 'center' }}>
                <div style={{ fontSize: '36px', fontWeight: 'bold', marginBottom: '10px' }}>{campaignHistory.reduce((sum, c) => sum + c.dealerships.length, 0)}</div>
                <div style={{ fontSize: '16px' }}>Total Messages</div>
              </div>
              <div style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', padding: '25px', borderRadius: '10px', color: 'white', boxShadow: '0 5px 15px rgba(0,0,0,0.1)', textAlign: 'center' }}>
                <div style={{ fontSize: '36px', fontWeight: 'bold', marginBottom: '10px' }}>{dailyUsage.sent} / 100</div>
                <div style={{ fontSize: '16px' }}>Today's Usage</div>
              </div>
            </div>
            <div style={{ background: 'white', padding: '20px', borderRadius: '10px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
              <h3 style={{ color: '#667eea', margin: '0 0 15px 0' }}>Features</h3>
              <p style={{ margin: '8px 0', color: '#555' }}>✅ WhatsApp cold campaigns</p>
              <p style={{ margin: '8px 0', color: '#555' }}>✅ Email cold campaigns</p>
              <p style={{ margin: '8px 0', color: '#555' }}>✅ CSV upload & download</p>
              <p style={{ margin: '8px 0', color: '#555' }}>✅ Campaign tracking & history</p>
              <p style={{ margin: '8px 0', color: '#555' }}>✅ Daily message limits (100/day)</p>
              <p style={{ margin: '8px 0', color: '#555' }}>✅ Custom message templates</p>
            </div>
          </div>
        )}

        {page === 'campaign' && (
          <div>
            <h2 style={{ color: '#667eea', marginBottom: '20px' }}>New Campaign</h2>
            <div style={{ background: 'white', padding: '30px', borderRadius: '10px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '10px', fontWeight: '600', color: '#333' }}>Select Channel</label>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    onClick={() => setCampaignType('whatsapp')}
                    style={{ flex: 1, padding: '12px', background: campaignType === 'whatsapp' ? '#667eea' : '#e0e0e0', color: campaignType === 'whatsapp' ? 'white' : 'black', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: '600' }}
                  >
                    💬 WhatsApp
                  </button>
                  <button
                    onClick={() => setCampaignType('email')}
                    style={{ flex: 1, padding: '12px', background: campaignType === 'email' ? '#667eea' : '#e0e0e0', color: campaignType === 'email' ? 'white' : 'black', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: '600' }}
                  >
                    📧 Email
                  </button>
                </div>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#333' }}>Country</label>
                <input
                  type="text"
                  placeholder="e.g., Barbados"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  style={{ width: '100%', padding: '10px', border: '2px solid #e0e0e0', borderRadius: '5px', boxSizing: 'border-box', fontSize: '14px' }}
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#333' }}>City</label>
                <input
                  type="text"
                  placeholder="e.g., Bridgetown"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  style={{ width: '100%', padding: '10px', border: '2px solid #e0e0e0', borderRadius: '5px', boxSizing: 'border-box', fontSize: '14px' }}
                />
              </div>

              <button
                onClick={handleSearch}
                style={{ width: '100%', padding: '12px', background: '#667eea', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: '600', marginBottom: '20px' }}
              >
                🔍 Search Dealers
              </button>

              {dealers.length > 0 && (
                <div style={{ padding: '20px', background: '#f0f4ff', borderRadius: '8px', marginBottom: '20px' }}>
                  <p style={{ color: '#667eea', fontWeight: '600', marginBottom: '15px' }}>Found {dealers.length} dealers</p>

                  <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#333', fontSize: '14px' }}>Number of Messages</label>
                    <input
                      type="number"
                      min="1"
                      max={Math.min(dealers.length, dailyUsage.remaining)}
                      value={quantity}
                      onChange={(e) => setQuantity(Math.min(parseInt(e.target.value) || 1, Math.min(dealers.length, dailyUsage.remaining)))}
                      style={{ width: '100%', padding: '10px', border: '2px solid #e0e0e0', borderRadius: '5px', boxSizing: 'border-box', fontSize: '14px' }}
                    />
                    <p style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>Max: {Math.min(dealers.length, dailyUsage.remaining)}</p>
                  </div>

                  <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#333', fontSize: '14px' }}>Delay Between Messages: {delay} seconds</label>
                    <input
                      type="range"
                      min="1"
                      max="60"
                      value={delay}
                      onChange={(e) => setDelay(parseInt(e.target.value))}
                      style={{ width: '100%' }}
                    />
                  </div>

                  {loading && (
                    <div style={{ marginBottom: '15px' }}>
                      <p style={{ color: '#667eea', fontWeight: '600', marginBottom: '8px' }}>Sending... {progress}%</p>
                      <div style={{ background: '#e0e0e0', height: '25px', borderRadius: '10px', overflow: 'hidden' }}>
                        <div style={{ background: '#667eea', height: '100%', width: progress + '%', transition: 'width 0.3s' }} />
                      </div>
                    </div>
                  )}

                  <button
                    onClick={handleSend}
                    disabled={loading}
                    style={{ width: '100%', padding: '12px', background: loading ? '#ccc' : '#27ae60', color: 'white', border: 'none', borderRadius: '5px', cursor: loading ? 'default' : 'pointer', fontWeight: '600' }}
                  >
                    {loading ? 'Sending...' : 'Send ' + quantity + ' ' + campaignType}
                  </button>
                </div>
              )}

              <div style={{ paddingTop: '20px', borderTop: '1px solid #e0e0e0' }}>
                <h3 style={{ color: '#667eea', margin: '0 0 15px 0' }}>Or Upload CSV</h3>
                <label style={{ display: 'block' }}>
                  <span style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#333', fontSize: '14px' }}>📤 CSV File</span>
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleCsvUpload}
                    style={{ width: '100%', padding: '10px', border: '2px solid #e0e0e0', borderRadius: '5px', boxSizing: 'border-box', cursor: 'pointer' }}
                  />
                  <p style={{ fontSize: '12px', color: '#666', marginTop: '8px' }}>Format: Name, Phone, Email, Address</p>
                </label>
              </div>
            </div>
          </div>
        )}

        {page === 'history' && (
          <div>
            <h2 style={{ color: '#667eea', marginBottom: '20px' }}>Campaign History</h2>
            {campaignHistory.length === 0 ? (
              <div style={{ background: 'white', padding: '30px', borderRadius: '10px', textAlign: 'center', color: '#666' }}>
                <p>No campaigns sent yet</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gap: '15px' }}>
                {campaignHistory.map((c) => (
                  <div key={c.id} style={{ background: 'white', padding: '20px', borderRadius: '10px', borderLeft: '4px solid #667eea', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                      <h3 style={{ margin: '0', color: '#667eea' }}>{c.city}, {c.country}</h3>
                      <span style={{ background: c.channel === 'whatsapp' ? '#25d366' : '#1890ff', color: 'white', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '600' }}>
                        {c.channel === 'whatsapp' ? '💬 WhatsApp' : '📧 Email'}
                      </span>
                    </div>
                    <p style={{ margin: '5px 0', color: '#666', fontSize: '14px' }}>{c.quantity} messages sent</p>
                    <p style={{ margin: '5px 0', color: '#999', fontSize: '12px' }}>{new Date(c.timestamp).toLocaleString()}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {page === 'settings' && (
          <div>
            <h2 style={{ color: '#667eea', marginBottom: '20px' }}>Settings</h2>
            <div style={{ background: 'white', padding: '30px', borderRadius: '10px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
              <div style={{ marginBottom: '30px' }}>
                <label style={{ display: 'block', marginBottom: '10px', fontWeight: '600', color: '#333' }}>WhatsApp Template</label>
                <textarea
                  value={msgTemplate}
                  onChange={(e) => setMsgTemplate(e.target.value)}
                  style={{ width: '100%', minHeight: '120px', padding: '12px', border: '2px solid #e0e0e0', borderRadius: '5px', boxSizing: 'border-box', fontFamily: 'monospace', fontSize: '13px' }}
                />
                <p style={{ fontSize: '12px', color: '#666', marginTop: '8px' }}>Use [DealerName], [YourName], [Company] as placeholders</p>
              </div>

              <div style={{ marginBottom: '30px' }}>
                <label style={{ display: 'block', marginBottom: '10px', fontWeight: '600', color: '#333' }}>Email Template</label>
                <textarea
                  value={emailTemplate}
                  onChange={(e) => setEmailTemplate(e.target.value)}
                  style={{ width: '100%', minHeight: '120px', padding: '12px', border: '2px solid #e0e0e0', borderRadius: '5px', boxSizing: 'border-box', fontFamily: 'monospace', fontSize: '13px' }}
                />
                <p style={{ fontSize: '12px', color: '#666', marginTop: '8px' }}>Use [DealerName], [YourName], [Company] as placeholders</p>
              </div>

              <button
                onClick={() => {
                  localStorage.setItem('msg_' + currentUser, msgTemplate);
                  localStorage.setItem('email_' + currentUser, emailTemplate);
                  alert('Templates saved!');
                }}
                style={{ padding: '12px 30px', background: '#27ae60', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: '600' }}
              >
                💾 Save Templates
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
