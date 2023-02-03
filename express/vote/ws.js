export const keyIndex = {
    value: 0
};

export const ws_error_obj = (ws, space, e) => {
    ws.send(JSON.stringify({
        type: 'Error',
        space,
        message: typeof e.error_description !== 'string' ? 'см. консоль' : e.error_description,
        keyIndex: ++keyIndex.value
    }));
};

export const ws_error_msg = (ws, space, message) => {
    ws.send(JSON.stringify({
        type: 'Error',
        space,
        message,
        keyIndex: ++keyIndex.value
    }));
};

export const ws_vote = (ws, address, project, propolsal, vote) => {
    ws.send(JSON.stringify({
        type: 'Vote',
        address,
        project,
        propolsal,
        vote,
        keyIndex: ++keyIndex.value
    }));
};

export const ws_sub = (ws, address, project) => {
    ws.send(JSON.stringify({
        type: 'Subscribe',
        address,
        project,
        keyIndex: ++keyIndex.value
    }));
};

export const ws_info = (ws, head, message) => {
    ws.send(JSON.stringify({
        type: 'Info',
        head,
        message,
        keyIndex: ++keyIndex.value
    }));
};

export const ws_end = (ws, message) => {
    ws.send(JSON.stringify({
        type: 'End',
        message,
        keyIndex: ++keyIndex.value
    }));
};

export const ws_error_end = (ws, head, message) => {
    ws.send(JSON.stringify({
        type: 'ErrorEnd',
        head,
        message,
        keyIndex: ++keyIndex.value
    }));
};