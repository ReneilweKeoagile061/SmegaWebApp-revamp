import hiveDriver from 'hive-driver';

const { TCLIService, HiveClient, HiveUtils, auth } = hiveDriver;

const client = new HiveClient(TCLIService);

const connectToHive = async () => {
  try {
    await client.connect({
      host: '10.128.200.51',
      port: 10000,
      options: {
        hiveServer2Principal: 'hive/10.128.200.51@CORP.BTC.BW',
        service: 'hive',
      },
    }, new auth.KerberosAuth());

    const session = await client.openSession();
    console.log('✅ Connected to Hive with Kerberos!');

    const result = await session.executeStatement('SELECT current_date');
    const rows = await HiveUtils.fetchAll(result);
    console.log('📅 Hive Result:', rows);

    await session.close();
    await client.close();
  } catch (err) {
    console.error('❌ Hive connection error:', err);
  }
};

connectToHive();
