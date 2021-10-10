function p(s) {
    return s < 10 ? '0' + s : s;
}

function getDate() {
    var orgDate = new Date();
    return orgDate.getFullYear() + "-" + p(orgDate.getMonth() + 1) + "-" + p(orgDate.getDate());
}

function getTime() {
    return new Date().toLocaleTimeString();
}


export {
    getDate,
    getTime
}