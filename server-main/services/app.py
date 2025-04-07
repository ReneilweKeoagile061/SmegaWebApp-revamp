from flask import Flask, request, jsonify
from pyhive import hive
import os

app = Flask(__name__)

@app.route("/query", methods=["POST"])
def query_hive():
    query = request.json.get("query")

    try:
        conn = hive.Connection(
            host=os.environ.get("HIVEHOST"),
            port=int(os.environ.get("HIVEPORT")),
            auth="KERBEROS",
            kerberos_service_name="hive",
            kerberos_principal=os.environ.get("KERBEROS_PRINCIPAL")
        )
        cursor = conn.cursor()
        cursor.execute(query)
        result = cursor.fetchall()
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(port=5000)
