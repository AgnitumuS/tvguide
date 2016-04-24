let _cache = {};

export function getPrograms(channelId, callback) {
    // calls to /api/programs are cached
    if (_cache.hasOwnProperty(channelId)) {
        callback(undefined, _cache[channelId]);
    } else {
        $.getJSON("/api/programs", {channelId}, (programs) => {
                for (let program of programs) {
                    program.start = new Date(program.start * 1000);
                    program.stop = new Date(program.stop * 1000);
                }
                _cache[channelId] = programs;
                callback(undefined, programs);
            })
            .fail(function (jqXHR, textStatus) {
                callback(textStatus);
            });
    }
}

export function getChannels(callback) {
    $.getJSON("/api/channels", (channels) => {
            callback(undefined, channels)
        })
        .fail(function(jqXHR, textStatus) {
            callback(textStatus);
        });
}