// A tiny cross-view channel: the overview/history set the key of an entry to
// load into the check-in form; the CheckinController subscribes and loads it.
// Keeps those views from reaching into the form directly.
import { signal } from './signal';

export const entryLoadRequest = signal<string | null>(null);

/** Request that the check-in form load the given entry, then switch to it. */
export function requestEntryLoad(key: string): void {
  entryLoadRequest.set(key);
  location.hash = 'checkin';
}
