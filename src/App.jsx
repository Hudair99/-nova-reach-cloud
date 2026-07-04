import React, { useState, useEffect } from 'react';

export default function NovaReachApp() {
  const [currentUser, setCurrentUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [page, setPage] = useState('login');
  
  const [users, setUsers] = useState({
    hudair: {
      id: 'hudair',
      password: 'hudair123!',
      email: 'hudairminai01@gmail.com',
      whatsappNumber: '03200382386',
      company: 'BE FORWARD Japan',
      messageTemplate: 'Hello,\n\nThis is [YourName] from BE FORWARD Japan.\n\nWe supply Japanese vehicles directly to dealerships and importers worldwide.\n\nWould you be interested in receiving our latest inventory and pricing?\n\nThank you.',
      emailTemplate: 'Subject: Japanese Vehicles Available\n\nHello [DealerName],\n\nThis is [YourName] from BE FORWARD Japan.\n\nWe supply Japanese vehicles directly to dealerships and importers worldwide.\n\nWould you be interested in receiving our latest inventory and pricing?\n\nBest regards,\n[YourName]',
      createdAt: new Date().toISOString()
    }
  });

  const [secretCode] = useState('admin705081');
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
    resetDailyCountIfNeeded();
  }, []);

  useEffect(() => {
    localStorage.setItem('novareach_data', JSON.stringify({
      users, campaignHistory, dailyMessageCount
    }));
  }, [users, campaignHistory, dailyMessageCount]);

  const resetDailyCountIfNeeded = () => {
    const today = new Date().toDateString();
    const lastReset = localStorage.getItem('novareach_last_reset');
    if (lastReset !== today) {
      setDailyMessageCount({});
      localStorage.setItem('novareach_last_reset', today);
    }
  };

  const handleLogin = (username, password) => {
    if (!users[username] || users[username].password !== password) return false;
    setCurrentUser(username);
    setIsAdmin(username === 'hudair');
    setPage(username === 'hudair' ? 'admin-unlock' : 'dashboard');
    return true;
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setIsAdmin(false);
    setPage('login');
  };

  const handleCreateUser = (newUser) => {
    setUsers({...users, [newUser.username]: {...newUser, id: newUser.username, createdAt: new Date().toISOString()}});
  };

  const handleFindDealerships = (country, city) => {
    return [
      {id: 1, name: 'Inchcape', phone: '+1246417777', email: 'info@inchcape.com', address: city + ', ' + country},
      {id: 2, name: 'ANSA Motors', phone: '+1246467240', email: 'contact@ansam otors.com', address: city + ', ' + country},
      {id: 3, name: 'Courtesy Garage', phone: '+1246431100', email: 'info@courtesygarage.com', address: city + ', ' + country},
      {id: 4, name: 'DV Motors', phone: '+1246283666', email: 'sales@dvmotors.com', address: city + ', ' + country},
      {id: 5, name: 'Pioneer Motors', phone: '+1246622200', email: 'info@pioneermotors.com', address: city + ', ' + country},
    ];
  };

  const handleSaveCampaign = (username, campaign) => {
    if (!campaignHistory[username]) campaignHistory[username] = [];
    const today = new Date().toDateString();
    let count = dailyMessageCount[username] || {date: today, count: 0};
    if (count.date !== today) {
      count = {date: today, count: 0};
    }
    count.count += campaign.dealerships.length;
    setCampaignHistory({...campaignHistory, [username]: [...(campaignHistory[username] || []), campaign]});
    setDailyMessageCount({...dailyMessageCount, [username]: count});
  };

  const getDailyUsage = (username) => {
    const today = new Date().toDateString();
    const count = dailyMessageCount[username];
    if (!count || count.date !== today) return {sent: 0, remaining: 100};
    return {sent: count.count, remaining: Math.max(0, 100 - count.count)};
  };

  if (!currentUser) return <LoginPage users={users} onLogin={handleLogin} />;
  if (isAdmin && page === 'admin-unlock') return <AdminUnlock secretCode={secretCode} onUnlock={() => setPage('admin')} onBack={() => {handleLogout(); setPage('login');}} />;
  if (isAdmin && page === 'admin') return <AdminDashboard currentUser={currentUser} users={users} onLogout={() => {handleLogout(); setPage('login');}} onCreateUser={handleCreateUser} campaignHistory={campaignHistory} />;

  return <UserDashboard currentUser={currentUser} user={users[currentUser]} users={users} onLogout={() => {handleLogout(); setPage('login');}} onFindDealerships={handleFindDealerships} onSaveCampaign={handleSaveCampaign} campaignHistory={campaignHistory[currentUser] || []} dailyUsage={getDailyUsage(currentUser)} setUsers={setUsers} />;
}

function NovaReachLogo() {
  return <div style={{display: 'flex', alignItems: 'center', gap: '12px'}}><svg width="40" height="40" viewBox="0 0 40 40" fill="none"><circle cx="20" cy="20" r="18" fill="#667eea" opacity="0.2" /><circle cx="20" cy="20" r="14" fill="none" stroke="#667eea" strokeWidth="2" /><polygon points="20,4 25,15 37,15 27,22 32,33 20,26 8,33 13,22 3,15 15,15" fill="#667eea" /><circle cx="20" cy="20" r="3" fill="#764ba2" /></svg><div><h1 style={{margin: '0', fontSize: '24px', fontWeight: 'bold', color: '#667eea'}}>Nova Reach</h1><p style={{margin: '0', fontSize: '11px', color: '#764ba2'}}>Multi-Channel Outreach</p></div></div>;
}

function LoginPage({users, onLogin}) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = () => {
    if (!username || !password) {setError('Please enter username and password'); return;}
    if (onLogin(username, password)) {setError('');} else {setError('Invalid credentials');}
  };

  return <div style={styles.container}><div style={styles.loginBox}><div style={{marginBottom: '40px'}}><NovaReachLogo /></div><div style={styles.formContainer}><div style={styles.inputGroup}><label style={styles.label}>Username</label><input type="text" value={username} onChange={(e) => {setUsername(e.target.value); setError('');}} onKeyPress={(e) => e.key === 'Enter' && handleLogin()} placeholder="Enter username" style={styles.input} /></div><div style={styles.inputGroup}><label style={styles.label}>Password</label><input type="password" value={password} onChange={(e) => {setPassword(e.target.value); setError('');}} onKeyPress={(e) => e.key === 'Enter' && handleLogin()} placeholder="Enter password" style={styles.input} /></div>{error && <div style={styles.error}>{error}</div>}<button style={styles.button} onClick={handleLogin}>Login</button></div><div style={styles.footer}><p style={styles.footerText}>Demo:</p><p style={styles.credentials}>Username: hudair</p><p style={styles.credentials}>Password: hudair123!</p><p style={{...styles.footerText, marginTop: '15px', fontSize: '11px'}}>WhatsApp + Email + CSV</p></div></div></div>;
}

function AdminUnlock({secretCode, onUnlock, onBack}) {
  const [codeInput, setCodeInput] = useState('');
  const [error, setError] = useState('');

  const handleUnlock = () => {
    if (codeInput === secretCode) {onUnlock(); setError('');} else {setError('Invalid code');}
  };

  return <div style={styles.container}><div style={styles.loginBox}><h1 style={{textAlign: 'center', color: '#667eea', marginBottom: '10px'}}>Admin</h1><input type="password" placeholder="Secret code" value={codeInput} onChange={(e) => {setCodeInput(e.target.value); setError('');}} onKeyPress={(e) => e.key === 'Enter' && handleUnlock()} style={styles.input} />{error && <div style={styles.error}>{error}</div>}<button style={styles.button} onClick={handleUnlock}>Unlock</button><button style={{...styles.button, background: '#e74c3c', marginTop: '10px'}} onClick={onBack}>Back</button></div></div>;
}

function AdminDashboard({currentUser, users, onLogout, onCreateUser, campaignHistory}) {
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({username: '', password: '', email: '', whatsappNumber: '', company: 'BE FORWARD Japan'});

  const handleCreate = () => {
    if (!form.username || !form.password || !form.email) {alert('Fill all fields'); return;}
    if (users[form.username]) {alert('User exists'); return;}
    onCreateUser({...form, messageTemplate: 'Hello [YourName] from ' + form.company, emailTemplate: 'Subject: Available\n\nHello [DealerName],\n\nInterested?'});
    alert('User ' + form.username + ' created!');
    setForm({username: '', password: '', email: '', whatsappNumber: '', company: 'BE FORWARD Japan'});
    setShowCreate(false);
  };

  return <div style={styles.appContainer}><div style={styles.header}><NovaReachLogo /><button style={styles.logoutButton} onClick={onLogout}>Logout</button></div><div style={styles.content}><div style={styles.section}><h2 style={styles.sectionTitle}>Users</h2><div style={styles.usersList}>{Object.entries(users).map(([username, userData]) => (<div key={username} style={styles.userCard}><div><h3 style={styles.userName}>{username}</h3><p style={styles.userDetail}>{userData.email}</p></div><span style={styles.statusActive}>OK</span></div>))}</div><button style={styles.createButton} onClick={() => setShowCreate(!showCreate)}>Create User</button></div>{showCreate && (<div style={styles.createUserSection}><input type="text" placeholder="Username" value={form.username} onChange={(e) => setForm({...form, username: e.target.value})} style={styles.input} /><input type="password" placeholder="Password" value={form.password} onChange={(e) => setForm({...form, password: e.target.value})} style={styles.input} /><input type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({...form, email: e.target.value})} style={styles.input} /><button style={styles.submitButton} onClick={handleCreate}>Create</button></div>)}<div style={styles.section}><h2 style={styles.sectionTitle}>Analytics</h2><div style={styles.statsGrid}><div style={styles.statCard}><div style={styles.statNumber}>{Object.keys(users).length}</div><div style={styles.statLabel}>Users</div></div></div></div></div></div>;
}

function UserDashboard({currentUser, user, users, onLogout, onFindDealerships, onSaveCampaign, campaignHistory, dailyUsage, setUsers}) {
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
    if (!country || !city) {alert('Enter country and city'); return;}
    const found = onFindDealerships(country, city);
    setDealers(found);
  };

  const handleSend = async () => {
    if (dealers.length === 0) {alert('No dealers found'); return;}
    if (quantity > dailyUsage.remaining) {alert('Only ' + dailyUsage.remaining + ' left today'); return;}
    setLoading(true);
    const selected = dealers.slice(0, quantity);
    const sent = [];
    for (let i = 0; i < selected.length; i++) {
      const d = selected[i];
      const template = campaignType === 'whatsapp' ? msgTemplate : emailTemplate;
      const msg = template.replace('[DealerName]', d.name).replace('[YourName]', currentUser).replace('[Company]', user.company);
      sent.push({name: d.name, phone: d.phone, email: d.email, address: d.address, message: msg, channel: campaignType, status: 'Sent', timestamp: new Date().toISOString()});
      setProgress(Math.round(((i + 1) / selected.length) * 100));
      await new Promise(r => setTimeout(r, delay * 1000));
    }
    onSaveCampaign(currentUser, {id: Date.now(), timestamp: new Date().toISOString(), country, city, quantity: selected.length, channel: campaignType, dealerships: sent});
    setLoading(false);
    setProgress(0);
    downloadCSV(sent);
    setDealers([]);
    alert(campaignType + ' campaign sent!');
  };

  const downloadCSV = (data) => {
    const csv = [['Name', 'Phone', 'Email', 'Address', 'Channel', 'Message', 'Status', 'Time'], ...data.map(d => [d.name, d.phone, d.email, d.address, d.channel, d.message, d.status, d.timestamp])].map(row => row.map(cell => '"' + cell + '"').join(',')).join('\n');
    const blob = new Blob([csv], {type: 'text/csv'});
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'nova-reach-' + Date.now() + '.csv';
    a.click();
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
        dealers.push({id: i, name: vals[0]?.trim() || '', phone: vals[1]?.trim() || '', email: vals[2]?.trim() || '', address: vals[3]?.trim() || ''});
      }
      setDealers(dealers);
      alert('CSV loaded: ' + dealers.length + ' dealers');
    };
    reader.readAsText(file);
  };

  return <div style={styles.appContainer}><div style={styles.header}><NovaReachLogo /><div style={{display: 'flex', gap: '10px'}}><span style={{color: '#333', fontWeight: '600'}}>{currentUser}</span><button style={styles.logoutButton} onClick={onLogout}>Logout</button></div></div><div style={styles.navTabs}><button style={{...styles.navTab, background: page === 'home' ? '#667eea' : '#e0e0e0', color: page === 'home' ? 'white' : 'black'}} onClick={() => setPage('home')}>Home</button><button style={{...styles.navTab, background: page === 'campaign' ? '#667eea' : '#e0e0e0', color: page === 'campaign' ? 'white' : 'black'}} onClick={() => setPage('campaign')}>Campaign</button><button style={{...styles.navTab, background: page === 'history' ? '#667eea' : '#e0e0e0', color: page === 'history' ? 'white' : 'black'}} onClick={() => setPage('history')}>History</button><button style={{...styles.navTab, background: page === 'settings' ? '#667eea' : '#e0e0e0', color: page === 'settings' ? 'white' : 'black'}} onClick={() => setPage('settings')}>Settings</button></div><div style={styles.content}>{page === 'home' && (<div style={styles.section}><h2 style={styles.sectionTitle}>Dashboard</h2><div style={styles.statsGrid}><div style={styles.statCard}><div style={styles.statNumber}>{campaignHistory.length}</div><div style={styles.statLabel}>Campaigns</div></div><div style={styles.statCard}><div style={styles.statNumber}>{campaignHistory.reduce((sum, c) => sum + c.dealerships.length, 0)}</div><div style={styles.statLabel}>Messages</div></div><div style={styles.statCard}><div style={styles.statNumber}>{dailyUsage.sent} / 100</div><div style={styles.statLabel}>Today</div></div></div></div>)}{page === 'campaign' && (<div style={styles.section}><h2 style={styles.sectionTitle}>New Campaign</h2><div style={styles.formGroup}><label style={styles.label}>Channel</label><div style={{display: 'flex', gap: '10px'}}><button style={{...styles.button, background: campaignType === 'whatsapp' ? '#667eea' : '#e0e0e0', width: '48%', color: campaignType === 'whatsapp' ? 'white' : 'black'}} onClick={() => setCampaignType('whatsapp')}>WhatsApp</button><button style={{...styles.button, background: campaignType === 'email' ? '#667eea' : '#e0e0e0', width: '48%', color: campaignType === 'email' ? 'white' : 'black'}} onClick={() => setCampaignType('email')}>Email</button></div></div><div style={styles.formGroup}><label style={styles.label}>Country</label><input type="text" placeholder="e.g., Barbados" value={country} onChange={(e) => setCountry(e.target.value)} style={styles.input} /></div><div style={styles.formGroup}><label style={styles.label}>City</label><input type="text" placeholder="e.g., Bridgetown" value={city} onChange={(e) => setCity(e.target.value)} style={styles.input} /></div><button style={styles.button} onClick={handleSearch}>Search</button>{dealers.length > 0 && (<div style={{marginTop: '20px', padding: '15px', background: '#f0f4ff', borderRadius: '8px'}}><p style={{color: '#667eea', fontWeight: '600', marginBottom: '15px'}}>Found {dealers.length} dealers</p><div style={styles.formGroup}><label style={styles.label}>Quantity</label><input type="number" min="1" max={Math.min(dealers.length, dailyUsage.remaining)} value={quantity} onChange={(e) => setQuantity(parseInt(e.target.value) || 1)} style={styles.input} /></div><div style={styles.formGroup}><label style={styles.label}>Delay</label><input type="range" min="1" max="60" value={delay} onChange={(e) => setDelay(parseInt(e.target.value))} style={{width: '100%'}} /><p style={{color: '#666', fontSize: '12px'}}>{delay}s</p></div>{loading && (<div style={{marginTop: '15px'}}><p style={{color: '#667eea', fontWeight: '600'}}>Sending... {progress}%</p><div style={{background: '#e0e0e0', height: '20px', borderRadius: '10px', overflow: 'hidden'}}><div style={{background: '#667eea', height: '100%', width: progress + '%'}} /></div></div>)}<button style={{...styles.button, marginTop: '15px', background: loading ? '#ccc' : '#27ae60'}} onClick={handleSend} disabled={loading}>Send</button></div>)}<div style={{marginTop: '30px', paddingTop: '30px', borderTop: '1px solid #e0e0e0'}}><label style={styles.label}>Upload CSV</label><input type="file" accept=".csv" onChange={handleCsvUpload} style={styles.input} /><p style={{color: '#666', fontSize: '12px'}}>Format: Name, Phone, Email, Address</p></div></div>)}{page === 'history' && (<div style={styles.section}><h2 style={styles.sectionTitle}>History</h2>{campaignHistory.length === 0 ? (<p style={{color: '#666'}}>No campaigns</p>) : (campaignHistory.map(c => (<div key={c.id} style={{...styles.userCard, marginBottom: '10px'}}><div><h4 style={{margin: '0 0 5px 0'}}>{c.city}, {c.country} ({c.channel})</h4><p style={{margin: '0', color: '#666', fontSize: '13px'}}>{c.quantity} messages</p></div></div>)))}</div>)}{page === 'settings' && (<div style={styles.section}><h2 style={styles.sectionTitle}>Settings</h2><div style={styles.formGroup}><label style={styles.label}>WhatsApp Template</label><textarea value={msgTemplate} onChange={(e) => setMsgTemplate(e.target.value)} style={{...styles.input, minHeight: '100px'}} /></div><div style={styles.formGroup}><label style={styles.label}>Email Template</label><textarea value={emailTemplate} onChange={(e) => setEmailTemplate(e.target.value)} style={{...styles.input, minHeight: '100px'}} /></div><button style={styles.submitButton} onClick={() => {setUsers(prev => ({...prev, [currentUser]: {...prev[currentUser], messageTemplate: msgTemplate, emailTemplate}})); alert('Saved!');}}>Save</button></div>)}</div></div>;
}

const styles = {
  container: {minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', fontFamily: 'Segoe UI, sans-serif', padding: '20px'},
  loginBox: {background: 'white', borderRadius: '15px', padding: '50px 40px', boxShadow: '0 20px 60px rgba(0,0,0,0.3)', maxWidth: '420px', width: '100%'},
  formContainer: {marginBottom: '30px'},
  inputGroup: {marginBottom: '20px'},
  label: {display: 'block', color: '#333', fontSize: '14px', fontWeight: '600', marginBottom: '8px'},
  input: {width: '100%', padding: '12px 15px', border: '2px solid #e0e0e0', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box', marginBottom: '10px'},
      
