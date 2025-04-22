import hive from "hive-driver";
import { config } from "dotenv";

// Load environment variables
config();

const {
  HIVE_HOST,
  HIVE_PORT,
  PRINCIPAL,
  KEYTAB_HOME,
  CONNECTION_TIMEOUT
} = process.env;

const { TCLIService, TCLIService_types } = hive.thrift;
const client = new hive.HiveClient(TCLIService, TCLIService_types);
const utils = new hive.HiveUtils(TCLIService_types);

const getSmegaStatement = async (query) => {
  try {
    // Log the authentication info being used
    console.log("🔐 Using Kerberos authentication:");
    console.log(`   Principal: ${PRINCIPAL}`);
    console.log(`   Keytab:    ${KEYTAB_HOME}`);

    // Connect to Hive using Kerberos with user principal
    await client.connect(
      {
        host: HIVE_HOST,
        port: parseInt(HIVE_PORT),
        options: {
          principal: PRINCIPAL,
          timeout: parseInt(CONNECTION_TIMEOUT)
        }
      },
      new hive.connections.TcpConnection(),
      new hive.auth.KerberosTcpAuthentication({
        principal: PRINCIPAL,
        keytabFile: KEYTAB_HOME
      })
    );

    console.log("✅ Kerberos authentication successful. Connected to Hive.");

    // Open session
    const session = await client.openSession({
      client_protocol: TCLIService_types.TProtocolVersion.HIVE_CLI_SERVICE_PROTOCOL_V10
    });

    console.log("📡 Hive session opened. Executing query...");

    // Execute query
    const operation = await session.executeStatement(query);
    await utils.waitUntilReady(operation, false, () => {});

    const selectDataOperation = await utils.fetchAll(operation);
    const results = utils.getResult(selectDataOperation).getValue();

    // Cleanup
    await operation.close();
    await session.close();

    console.log("📁 Query executed and session closed successfully.");
    return results;

  } catch (err) {
    console.error("❌ Error in getSmegaStatement:", err);
    throw err;
  }
};

export { getSmegaStatement };
