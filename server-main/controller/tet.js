const { TCLIService, HiveClient, HiveUtils, auth } = require('hive-driver');

(async () => {
  const client = new HiveClient(TCLIService);

  try {
    // Replace with actual principal configured on HiveServer2
    await client.connect({
      host: '10.128.200.51',
      port: 10000,
      options: {
        hiveServer2Principal: 'hive/10.128.200.51@CORP.BTC.BW', // 👈 adjust if needed
        service: 'hive',
      },
    }, new auth.KerberosAuth());

    const session = await client.openSession();
    console.log('✅ Connected to Hive with Kerberos!');

    // Run a simple query
    const result = await session.executeStatement('SELECT current_date');
    const rows = await HiveUtils.fetchAll(result);
    console.log('📅 Hive Result:', rows);

    await session.close();
    await client.close();
  } catch (err) {
    console.error('❌ Error connecting to Hive:', err);
  }
})();
