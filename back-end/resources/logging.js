var getTimestamp = function() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    return `[${hours}:${minutes}]`;
};

var log = function(string) {
    MapTool.chat.broadcastToGM(`<span style="color: #666">${getTimestamp()} ${string}</span>`);
};

var public_log = function(string) {
    MapTool.chat.broadcast(`${getTimestamp()} ${string}`);
};