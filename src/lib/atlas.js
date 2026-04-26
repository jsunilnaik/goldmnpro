export const runtime = 'edge';

const API_KEY = process.env.MONGODB_DATA_API_KEY;
const API_URL = process.env.MONGODB_DATA_API_URL;
const CLUSTER = process.env.MONGODB_CLUSTER;
const DATABASE = process.env.MONGODB_DATABASE;

async function atlasFetch(action, body) {
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
    return await response.json();
}

export const db = {
    findOne: (collection, filter) => atlasFetch('findOne', { collection, filter }),
    find: (collection, filter) => atlasFetch('find', { collection, filter }),
    insertOne: (collection, document) => atlasFetch('insertOne', { collection, document }),
    updateOne: (collection, filter, update) => atlasFetch('updateOne', { collection, filter, update }),
    // Add other methods as needed...
};
