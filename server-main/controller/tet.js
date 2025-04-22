import hive from 'hive-driver';

const { TCLIService, HiveClient, auth } = hive;

const client = new HiveClient(TCLIService);

async function connectToHive() {
  try {
    const connection = auth.createKerberosTcpConnection({
      host: '10.128.200.51',
      port: 10000,
      service: 'hive',
      principal: 'prodbi@CORP.BTC.BW',
      timeout: 300000
    });

    const session = await client.connect(connection, {});

    console.log('✅ Connected to Hive via Kerberos.');

    const result = await session.executeStatement('SELECT current_date');
    const data = await result.fetchAll();
    console.log('📅 Hive Query Result:', data);

    await session.close();
    await client.close();
  } catch (error) {
    console.error('❌ Hive connection error:', error);
  }
}

connectToHive();
