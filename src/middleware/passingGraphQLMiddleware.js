const { parse } = require('graphql');

/**
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 * @returns 
 */
module.exports = async (req, res, next) => {
    const body = req.body;
    const isIntrospection = body?.operationName === 'IntrospectionQuery';

    if (!isIntrospection) {
      console.log('Request Body =', body);
    }

    if (!body || !body.query) return next();

    const ast = parse(body.query);
    // const operationName = ast.definitions[0].name.value;
    const operationDefinition = ast.definitions.find(def => def.kind === 'OperationDefinition');
    const operationNames = operationDefinition.selectionSet.selections.map(item => item.name.value);
    // const operationName = operationDefinition.selectionSet.selections[0].name.value;
    const operationType = operationDefinition?.operation;

    const selectedFields = [];
    const extractFields = (selections) => {
        for (const selection of selections) {
            const selectionSet = selection?.selectionSet;
            if (selectionSet) {
                const fields = selectionSet.selections.map(selection => selection.name.value);
                selectedFields.push(...fields);
            }
        }
        // selectionSet.selections.forEach(selection => {
        //     if (selection.kind === 'Field') {
        //         const fieldDirectives = getDirectives(selection);
        //         selectedFields.push({
        //             name: selection.name.value,
        //             directives: fieldDirectives
        //         });
        //     } else if (selection.kind === 'FragmentSpread') {
        //         const fragment = ast.definitions.find(def => def.kind === 'FragmentDefinition' && def.name.value === selection.name.value);
        //         extractFields(fragment.selectionSet);
        //     } else if (selection.kind === 'InlineFragment') {
        //         extractFields(selection.selectionSet);
        //     }
        // });
    };

    const selections = operationDefinition.selectionSet.selections;
    extractFields(selections);

    req.selectedFields = selectedFields;
    req.operationType = operationType;
    // req.operationName = operationName;
    req.operationNames = operationNames;

    if (!isIntrospection && !operationNames.includes('__schema')) {
      console.log({ operationType, operationNames });
    }

    return next();
};