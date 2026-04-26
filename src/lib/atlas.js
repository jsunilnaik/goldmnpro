export const runtime = 'edge';

const API_KEY = process.env.MONGODB_DATA_API_KEY;
const API_URL = process.env.MONGODB_DATA_API_URL;
const CLUSTER = process.env.MONGODB_CLUSTER || 'Cluster0';
const DATABASE = process.env.MONGODB_DATABASE || 'goldmine-pro';

async function atlasFetch(action, body) {
    if (!API_KEY || !API_URL) {
        throw new Error('MongoDB Data API credentials missing in environment variables');
    }

    const response = await fetch(`${API_URL}/action/${action}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'api-key': API_KEY,
        },
        body: JSON.stringify({
            dataSource: CLUSTER,
            database: DATABASE,
            ...body,
        }),
    });
    
    const data = await response.json();
    if (data.error) throw new Error(data.error);
    return data;
}

export const db = {
    findOne: async (collection, filter) => {
        const res = await atlasFetch('findOne', { collection, filter });
        return res.document;
    },
    find: async (collection, filter, sort = {}, limit = 100) => {
        const res = await atlasFetch('find', { collection, filter, sort, limit });
        return res.documents;
    },
    insertOne: async (collection, document) => {
        const res = await atlasFetch('insertOne', { collection, document });
        return res.insertedId;
    },
    updateOne: async (collection, filter, update, upsert = false) => {
        const res = await atlasFetch('updateOne', { collection, filter, update, upsert });
        return res;
    },
    findById: async (collection, id) => {
        const res = await atlasFetch('findOne', { collection, filter: { _id: { "$oid": id } } });
        return res.document;
    }
};
