module.exports = {
    elasticsearch: {
        host: process.env.I_VOTE_ES_HOST,
        port: process.env.I_VOTE_ES_PORT,
        user: process.env.I_VOTE_ES_USER,
        password: process.env.I_VOTE_ES_PWD,
        index: process.env.I_VOTE_ES_INDEX
    }
};
