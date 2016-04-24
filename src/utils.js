String.prototype.mapReplace = function(map) {
    let regex = [];
    for(let key in map)
        regex.push(key.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&"));
    return this.replace(new RegExp(regex.join('|'),"g"),function(word){
        return map[word];
    });
};

export function saveRestoreElemState($elem, storageKey) {
    if (localStorage) {
        // restore saved data from local storage
        let savedData = localStorage.getItem(storageKey);
        if (savedData)
            $elem.val(savedData.split(","));

        // set a saving hook on select change
        $elem.change(function() {
            localStorage.setItem(
                storageKey,
                $elem.val()
            );
        });
    }
}


const DAY_BREAK_HOUR = 5;

// TODO: check what day is it now, idiot
export function getDayEnd(date) {
    let break_hour = new Date(copyDate(date).setHours(DAY_BREAK_HOUR, 0, 0, 0)); // 5:00 of today
    if (date < break_hour) {
        // 0:00 - 4:59
        return break_hour;
    } else {
        // 5:00 - 23:99
        return new Date(getTomorrow(copyDate(date)).setHours(DAY_BREAK_HOUR - 1, 59, 59));
    }
}

export function getDayStart(date) {
    let break_hour = new Date(copyDate(date).setHours(DAY_BREAK_HOUR, 0, 0, 0)); // 5:00 of today
    if (date < break_hour) {
        // 0:00 - 4:59
        return new Date(getYesterday(copyDate(date)).setHours(DAY_BREAK_HOUR - 1, 59, 59));
    } else {
        // 5:00 - 23:99
        return break_hour;
    }
}

const copyDate = date => new Date(date.getTime());
export const getTomorrow = date => new Date(date.setDate(date.getDate() + 1));
export const getYesterday = date => new Date(date.setDate(date.getDate() - 1));


export function displayError() {
    alert("Не удалось получить данные!");
}

export function timeFormat(date) {
    let hours = String(date.getHours());
    let minutes = String(date.getMinutes());

    if (hours.length == 1)
        hours = "0" + hours;

    if (minutes.length == 1)
        minutes = "0" + minutes;

    return hours + ':' + minutes;
}

const weekDays = ["вс", "пн", "вт", "ср", "чт", "пт", "сб"];
export function dateFormat(d) {
    let day = d.getDay();
    let date = d.getDate();

    return weekDays[day] + " " + date;
}