import hiveDriver from 'hive-driver';

const { HiveClient, TCLIService_types, thrift } = hiveDriver;

// Initialize client with TCLIService_types
const client = new HiveClient(hiveDriver.TCLIService);

async function connectToHive() {
  try {
    const connection = await client.connect({
      host: '10.128.200.51',
      port: 10000,
      options: {
        transport: thrift.TBufferedTransport,
        protocol: thrift.TBinaryProtocol,
        auth: 'KERBEROS',
        krbServiceName: 'hive',
        principal: 'prodbi@CORP.BTC.BW',
      },
    });

    console.log('✅ Connected to Hive via Kerberos.');

    const session = await connection.openSession();
    const result = await session.executeStatement('SELECT current_date');
    const data = await result.fetchAll();

    console.log('📅 Hive Query Result:', data);

    await session.close();
    await client.close();
  } catch (err) {
    console.error('❌ Hive connection error:', err.stack);
  }
}

// Run the connection
connectToHive();
