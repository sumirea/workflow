// A workflow file that pauses at a Checkpoint. `pause` comes from the SDK — a
// workflow author uses the public @sumirea/sdk contract, never @sumirea/core.
import { pause } from '@sumirea/sdk';

export default {
  name: 'file-pausing',
  steps: [{ name: 'gate', run: (state) => pause({ name: 'review' }, state) }],
};
