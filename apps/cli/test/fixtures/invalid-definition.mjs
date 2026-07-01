// A default export that is not a valid WorkflowDefinition (empty name, no steps);
// createInstance rejects it, so `run` reports invalid input.
export default { name: '', steps: [] };
