import { readJobsFile } from '#lib/models/snapshot-job.js';

/**
 * Reads jobs.json off the page's thread: parsing and sorting tens of thousands of
 * jobs would keep a phone from showing anything for seconds.
 * Gets the file's bytes, answers readJobsFile's result (null when it is not one).
 */
self.onmessage = (/** @type {MessageEvent<ArrayBuffer>} */ event) => {
	let read = null;
	try {
		read = readJobsFile(JSON.parse(new TextDecoder().decode(event.data)));
	} catch {
		// not JSON: no snapshot
	}
	self.postMessage(read);
};
