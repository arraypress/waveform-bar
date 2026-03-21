/**
 * WaveformBar v1.0.0
 * Persistent bottom audio player bar for WaveformPlayer
 *
 * @author ArrayPress
 * @license MIT
 */

import {WaveformBar} from './core.js';

// Create singleton instance
const instance = new WaveformBar();

// Browser global
if (typeof window !== 'undefined') {
    window.WaveformBar = instance;
}

export default instance;
export {WaveformBar};
