export const communication = (() => {
    let events = {};
    const subscribe = (evName, f) => {
        events[evName] = events[evName] || [];
        events[evName].push(f);
    }
    const unsubscribe = (evName, f) => {
        if (events[evName]) events[evName] = events[evName].filter(fn => fn !== f)
    }
    const publish = (evName, data) => {
        if(events[evName]) {
            events[evName].forEach(fn => fn(data));
        }
    }
    return {subscribe, unsubscribe, publish}
})()

