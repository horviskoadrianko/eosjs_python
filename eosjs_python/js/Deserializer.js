const {createInitialTypes, getType, getTypesFromAbi, hexToUint8Array, deserializeActionData} = require('eosjs/dist/eosjs-serialize');
const { Api, JsonRpc } = require('eosjs');
const fetch = require('node-fetch');

const endpoint = process.argv[2];
const cAbiHex = process.argv[3];
const cAccount = process.argv[4];
const actName = process.argv[5];
const actDataHex = process.argv[6];

/**
 * Deserializes action data based on a specific contract abi.
 */
function deserializeActData(endpoint, cAbiHex, cAccount, actName, actDataHex) {    
    //Setup API
    const rpc = new JsonRpc(endpoint, { fetch });
    const api = new Api({
        rpc,
        signatureProvider: null,
        textDecoder: new TextDecoder(),
        textEncoder: new TextEncoder()
      })
    
    //Deserialize contract abi
    const cAbiRaw = hexToUint8Array(cAbiHex);
    const cAbiJson = api.rawAbiToJson(cAbiRaw);
    const types = getTypesFromAbi(createInitialTypes(), cAbiJson);
    const actions = new Map();
    for (const { name, type } of cAbiJson.actions) {
        actions.set(name, getType(types, type));
    }
    const contract = { types, actions };
    
    //Deserialize action data with contract abi
    const actDataJson = deserializeActionData(
                contract,
                cAccount,
                actName,
                actDataHex,
                new TextEncoder(),
                new TextDecoder());

    console.log(JSON.stringify(actDataJson));
}

deserializeActData(endpoint, cAbiHex, cAccount, actName, actDataHex);