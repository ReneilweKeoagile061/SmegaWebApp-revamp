import hive from "hive-driver";
import { config } from "dotenv";
import { execSync } from "child_process";

config();

const { TCLIService, TCLIService_types } = hive.thrift;
const client = new hive.HiveClient(TCLIService, TCLIService_types);
const utils = new hive.HiveUtils(TCLIService_types);

const getSmegaStatement = async (query) => {
    try {
        // Step 1: Run kinit using keytab and principal
        const keytabPath = process.env.KEYTAB_HOME;
        const principal = process.env.PRINCIPAL;

        console.log("Running kinit...");
        execSync(`kinit -kt ${keytabPath} ${principal}`);
        console.log("kinit successful");

        // Step 2: Connect to Hive using existing Kerberos ticket
        await client.connect(
            {
                host: process.env.HIVE_HOST,
                port: parseInt(process.env.HIVE_PORT),
                options: {
                    principal,
                    kerberosServiceName: 'hive',
                    timeout: parseInt(process.env.CONNECTION_TIMEOUT),
                }
            },
            new hive.connections.TcpConnection() // No Kerberos auth object here
        );

        const session = await client.openSession({
            client_protocol: TCLIService_types.TProtocolVersion.HIVE_CLI_SERVICE_PROTOCOL_V10,
        });

        const operation = await session.executeStatement(query);
        await utils.waitUntilReady(operation, false, () => {});
        const selectDataOperation = await utils.fetchAll(operation);
        const results = utils.getResult(selectDataOperation).getValue();

        await operation.close();
        await session.close();

        return results;
    } catch (err) {
        console.error("Error in getSmegaStatement:", err);
        throw err;
    }
};

export { getSmegaStatement };
