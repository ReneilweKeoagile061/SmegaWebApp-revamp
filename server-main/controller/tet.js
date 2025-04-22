const connection = await client.connect({
  host: '10.128.200.51',
  port: 10000,
  options: { auth: 'NONE' }, // Try without Kerberos
});