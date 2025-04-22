import hive from "hive-driver";
import { config } from "dotenv";
import kerberos from "kerberos";

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
    console.log("🔐 Using Kerberos authentication:");
    console.log(`   Principal: ${PRINCIPAL}`);
    console.log(`   Keytab:    ${KEYTAB_HOME}`);

    // Create the kerberos client synchronously to pass into authProcess
    const kerberosClient = await kerberos.initializeClient(PRINCIPAL, {
      keytab: KEYTAB_HOME,
      service: 'hive',
      mechOID: kerberos.GSS_MECH_OID_KRB5
    });

    const authProcess = {
      init: (_, callback) => {
        console.log("✅ init() called");
        callback(null, kerberosClient);
      },
      transition: (challenge, callback) => {
        console.log("🔄 transition() called with challenge:", challenge);
        kerberosClient.step(challenge, (err, response) => {
          callback(err, response);
        });
      }
    };

    await client.connect(
      {
        host: HIVE_HOST,
        port: parseInt(HIVE_PORT),
        options: {
          principal: PRINCIPAL,
          kerberosServiceName: 'hive',
          timeout: parseInt(CONNECTION_TIMEOUT)
        }
      },
      new hive.connections.TcpConnection(),
      new hive.auth.KerberosTcpAuthentication(
        {
          principal: PRINCIPAL,
          keytabFile: KEYTAB_HOME
        },
        authProcess // 👈 Ensure this is being passed
      )
    );

    console.log("✅ Kerberos authentication successful. Connected to Hive.");

    const session = await client.openSession({
      client_protocol: TCLIService_types.TProtocolVersion.HIVE_CLI_SERVICE_PROTOCOL_V10
    });

    console.log("📡 Hive session opened. Executing query...");

    const operation = await session.executeStatement(query);
    await utils.waitUntilReady(operation, false, () => {});

    const selectDataOperation = await utils.fetchAll(operation);
    const results = utils.getResult(selectDataOperation).getValue();

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
