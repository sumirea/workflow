// A workflow file: default-exports a WorkflowDefinition that completes.
export default {
  name: 'file-demo',
  initialState: { count: 0 },
  steps: [
    { name: 'step-one', run: (state) => ({ ...state, one: true }) },
    { name: 'step-two', run: (state) => ({ ...state, two: true }) },
  ],
};
