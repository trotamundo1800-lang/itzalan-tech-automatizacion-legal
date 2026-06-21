(async ()=>{
  const base = 'http://localhost:3001';
  const user = { email: `test+${Date.now()}@example.com`, password: 'Password123!', name: 'Test User' };
  try {
    console.log('registering', user.email);
    let r = await fetch(base + '/auth/register', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email: user.email, password: user.password, name: user.name })
    });
    let reg = await r.text();
    console.log('register status', r.status, 'body:', reg);

    console.log('logging in');
    let lr = await fetch(base + '/auth/login', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email: user.email, password: user.password })
    });
    let login = await lr.json().catch(()=>null);
    console.log('login status', lr.status, 'body:', login);

    const access = login?.access_token || login?.accessToken || login?.token;
    const refresh = login?.refreshToken || login?.refresh_token;
    if (!access) {
      console.error('No access token received, aborting');
      process.exit(2);
    }

    console.log('getting profile with access token');
    let pr = await fetch(base + '/auth/profile', { headers: { Authorization: 'Bearer ' + access } });
    let profile = await pr.text();
    console.log('profile status', pr.status, 'body:', profile);

    console.log('trying refresh');
    let rr = await fetch(base + '/auth/refresh', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ refreshToken: refresh })
    });
    let refreshBody = await rr.text();
    console.log('refresh status', rr.status, 'body:', refreshBody);

    console.log('logging out');
    let lo = await fetch(base + '/auth/logout', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ refreshToken: refresh })
    });
    let logoutBody = await lo.text();
    console.log('logout status', lo.status, 'body:', logoutBody);

    console.log('E2E test finished');
    process.exit(0);
  } catch (e) {
    console.error('Error during E2E test', e);
    process.exit(1);
  }
})();
