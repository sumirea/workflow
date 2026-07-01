// A module with no default export — invalid input for `run`.
export const workflow = {
  name: 'named-only',
  steps: [{ name: 'a', run: (state) => state }],
};
