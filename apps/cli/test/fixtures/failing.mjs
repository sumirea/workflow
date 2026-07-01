// A workflow file whose Step throws — the Runtime terminates it as `failed`.
export default {
  name: 'file-failing',
  steps: [
    {
      name: 'boom',
      run: () => {
        throw new Error('kaboom');
      },
    },
  ],
};
