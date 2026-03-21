/**
 * @module actions
 * @description Action button handlers (favorite, cart) for WaveformBar
 */

/**
 * Fire an action to an endpoint or callback
 * @param {Object} actionConfig - { endpoint, method, headers }
 * @param {Object} payload - Data to send
 */
export function fireAction(actionConfig, payload) {
    if (!actionConfig || !actionConfig.endpoint) return;

    // Callback function
    if (typeof actionConfig.endpoint === 'function') {
        try {
            actionConfig.endpoint(payload);
        } catch (err) {
            console.warn('WaveformBar action callback error:', err);
        }
        return;
    }

    // REST endpoint
    if (typeof actionConfig.endpoint === 'string') {
        fetch(actionConfig.endpoint, {
            method: actionConfig.method || 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...(actionConfig.headers || {})
            },
            body: JSON.stringify(payload)
        }).catch(err => console.warn('WaveformBar action request failed:', err));
    }
}
