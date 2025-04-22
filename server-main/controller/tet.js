import hive from 'hive-driver';

const { TCLIService, HiveClient } = hive;

const client = new HiveClient(TCLIService);

async function connectToHive() {
  try {
    const connection = client.connect({
      host: '10.128.200.51',
      port: 10000,
      options: {
        // This tells hive-driver to use Kerberos ticket from the cache
        auth: 'KERBEROS',
        krbServiceName: 'hive', // This matches Hive server config (usually 'hive')
        principal: 'prodbi@CORP.BTC.BW', // Must match your Kerberos principal
      },
    });

    const session = await (await connection).openSession();
    console.log('✅ Connected to Hive using Kerberos ticket.');

    const result = await session.executeStatement('SELECT current_date');
    const data = await result.fetchAll();
    console.log('📅 Hive query result:', data);

    await session.close();
    await client.close();
  } catch (err) {
    console.error('❌ Hive connection error:', err);
  }
}

connectToHive();
