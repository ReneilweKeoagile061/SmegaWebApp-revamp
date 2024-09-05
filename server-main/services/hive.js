import hive from "hive-driver";
import { config } from "dotenv";

config();

const { TCLIService, TCLIService_types } = hive.thrift;
const client = new hive.HiveClient(TCLIService, TCLIService_types);
const utils = new hive.HiveUtils(TCLIService_types);

const getSmegaStatement = async (query) => {
    try {
        await client.connect(
            {
                host: process.env.HiveHost,
                port: process.env.HivePort
            },
            new hive.connections.TcpConnection(),
            new hive.auth.PlainTcpAuthentication({
                username: process.env.HiveUsername,
                password: process.env.HivePassword
            })
        );

        const session = await client.openSession({
            client_protocol: TCLIService_types.TProtocolVersion.HIVE_CLI_SERVICE_PROTOCOL_V10
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