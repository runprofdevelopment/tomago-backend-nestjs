const { parse } = require('graphql');

/**
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 * @returns 
 */
module.exports = async (req, res, next) => {
    const url = req.url;
    
    if (!url) return next();
    
    const operationType = req.method == 'GET' ? 'query' : 'mutation';
    
    const operationName = url.replace('/rest-api/', '');
    const operationNames = operationName ? [operationName] : [];
    
    req.operationType = operationType;
    req.operationNames = operationNames;
    console.log({ operationType, operationNames });
    
    return next();
};