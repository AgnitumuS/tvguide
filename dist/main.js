(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    (factory());
}(this, function () { 'use strict';

    String.prototype.mapReplace = function (map) {
        var regex = [];
        for (var key in map) {
            regex.push(key.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&"));
        }return this.replace(new RegExp(regex.join('|'), "g"), function (word) {
            return map[word];
        });
    };

    function saveRestoreElemState($elem, storageKey) {
        if (localStorage) {
            // restore saved data from local storage
            var savedData = localStorage.getItem(storageKey);
            if (savedData) $elem.val(savedData.split(","));

            // set a saving hook on select change
            $elem.change(function () {
                localStorage.setItem(storageKey, $elem.val());
            });
        }
    }

    var DAY_BREAK_HOUR = 5;

    // TODO: check what day is it now, idiot
    function getDayEnd(date) {
        var break_hour = new Date(copyDate(date).setHours(DAY_BREAK_HOUR, 0, 0, 0)); // 5:00 of today
        if (date < break_hour) {
            // 0:00 - 4:59
            return break_hour;
        } else {
            // 5:00 - 23:99
            return new Date(getTomorrow(copyDate(date)).setHours(DAY_BREAK_HOUR - 1, 59, 59));
        }
    }

    function getDayStart(date) {
        var break_hour = new Date(copyDate(date).setHours(DAY_BREAK_HOUR, 0, 0, 0)); // 5:00 of today
        if (date < break_hour) {
            // 0:00 - 4:59
            return new Date(getYesterday(copyDate(date)).setHours(DAY_BREAK_HOUR - 1, 59, 59));
        } else {
            // 5:00 - 23:99
            return break_hour;
        }
    }

    var copyDate = function copyDate(date) {
        return new Date(date.getTime());
    };
    var getTomorrow = function getTomorrow(date) {
        return new Date(date.setDate(date.getDate() + 1));
    };
    var getYesterday = function getYesterday(date) {
        return new Date(date.setDate(date.getDate() - 1));
    };

    function displayError() {
        alert("Не удалось получить данные!");
    }

    function timeFormat(date) {
        var hours = String(date.getHours());
        var minutes = String(date.getMinutes());

        if (hours.length == 1) hours = "0" + hours;

        if (minutes.length == 1) minutes = "0" + minutes;

        return hours + ':' + minutes;
    }

    var weekDays = ["вс", "пн", "вт", "ср", "чт", "пт", "сб"];
    function dateFormat(d) {
        var day = d.getDay();
        var date = d.getDate();

        return weekDays[day] + " " + date;
    }

    var _cache = {};

    function getPrograms(channelId, callback) {
        // calls to /api/programs are cached
        if (_cache.hasOwnProperty(channelId)) {
            callback(undefined, _cache[channelId]);
        } else {
            $.getJSON("/api/programs", { channelId: channelId }, function (programs) {
                var _iteratorNormalCompletion = true;
                var _didIteratorError = false;
                var _iteratorError = undefined;

                try {
                    for (var _iterator = programs[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                        var program = _step.value;

                        program.start = new Date(program.start * 1000);
                        program.stop = new Date(program.stop * 1000);
                    }
                } catch (err) {
                    _didIteratorError = true;
                    _iteratorError = err;
                } finally {
                    try {
                        if (!_iteratorNormalCompletion && _iterator.return) {
                            _iterator.return();
                        }
                    } finally {
                        if (_didIteratorError) {
                            throw _iteratorError;
                        }
                    }
                }

                _cache[channelId] = programs;
                callback(undefined, programs);
            }).fail(function (jqXHR, textStatus) {
                callback(textStatus);
            });
        }
    }

    function getChannels(callback) {
        $.getJSON("/api/channels", function (channels) {
            callback(undefined, channels);
        }).fail(function (jqXHR, textStatus) {
            callback(textStatus);
        });
    }

    var DEFAULT_SELECTED_CHANNELS = 5;

    var templates = {
        init: function init() {
            // load templates from DOM
            templates._CHANNEL_TEMPLATE = $("#channel-template").html().mapReplace({
                "data-src": "src" // use data-src not to request %CHANNEL_ICON%
            });
            templates._PROGRAM_TEMPLATE = $("#program-template").html();
            templates._CATEGORY_OPTION_TEMPLATE = $("#category-option-template").html();

            templates._NO_PROGRAM_DESCRIPTION = $("#no-program-description-template").html();

            templates.SHOW_ALL = $("#show-all-template").html();
            templates.HIDE = $("#hide-template").html();
        },
        channel: function channel(channelId, channelData) {
            return templates._CHANNEL_TEMPLATE.mapReplace({
                "%CHANNEL_ID%": channelId,
                "%CHANNEL_ICON%": channelData.icon,
                "%CHANNEL_TITLE%": channelData.name
            });
        },
        program: function program(programData, channelId) {
            return templates._PROGRAM_TEMPLATE.mapReplace({
                "%PROGRAM_START%": timeFormat(programData.start),
                "%PROGRAM_TITLE%": programData.title,
                "%PROGRAM_DESCRIPTION%": programData.desc || templates._NO_PROGRAM_DESCRIPTION,
                "%PROGRAM_DESC_ID%": channelId + programData.start.getTime(), // generate unique id for program in DOM
                "%PROGRAM_CATEGORY%": programData.category || "Без категории",
                "%PROGRAM_AGE%": programData.ageRestriction,
                "%PROGRAM_CATEGORY_ICON%": templates.categoryIcons[programData.category] || templates.categoryIcons.general
            });
        },
        categoryIcons: {
            general: "icon-film",
            "Развлекательные": "icon-happy",
            "Информационные": "icon-info",
            "Познавательные": "icon-microscope",
            "Сериал": "icon-tv",
            "Художественный фильм": "icon-film2",
            "Детям": "icon-child_care",
            "Для взрослых": "icon-man-woman",
            "Спорт": "icon-futbol-o"
        },
        categoryOption: function categoryOption(category) {
            return templates._CATEGORY_OPTION_TEMPLATE.mapReplace({
                "%CATEGORY_NAME%": category == "general" ? "Все категории передач" : category,
                "%CATEGORY_ICON%": templates.categoryIcons[category] || templates.categoryIcons.general
            });
        }
    };

    $(function () {

        templates.init();

        var $channelsSelect = $("#channels-select");
        var $categoriesSelect = $("#categories-select");
        var $channelsWrapper = $("#channels-wrapper");

        var shownTime = new Date();
        var shownCategory = "general";

        var channels = void 0;

        for (var category in templates.categoryIcons) {
            $categoriesSelect.append("<option value=\"" + category + "\">" + category + "</option>");
        }

        // enable category selector
        saveRestoreElemState($categoriesSelect, "savedCategory");
        $categoriesSelect.change(function () {
            shownCategory = $categoriesSelect.val();
            if (channels) onUpdateChannelSelection(); //trigger only if channels are loaded
        }).change();
        $categoriesSelect.multiselect({
            enableHTML: true,
            optionLabel: function optionLabel(element) {
                return templates.categoryOption($(element).text());
            },
            buttonText: function buttonText(options, select) {
                return templates.categoryOption(select.val());
            }
        });

        // init day tabs
        var todayStart = getDayStart(new Date());
        $("#today-date").html(dateFormat(todayStart));
        $("#tommorow-date").html(dateFormat(getTomorrow(todayStart)));
        $('#day-tabs a').click(function (e) {
            e.preventDefault();
            $(this).tab('show');

            if ($(this).data("day") == "today") {
                shownTime = new Date();
            } else if ($(this).data("day") == "tomorrow") {
                shownTime = getTomorrow(getDayStart(new Date()));
            }

            if (channels) onUpdateChannelSelection(); //trigger only if channels are loaded
        });

        // init show all programs btn
        $(document).on('click', '.show-all-btn', function () {
            var $panel = $(this).closest(".channel-panel");

            $panel.toggleClass("collapsed");
            if ($panel.hasClass("collapsed")) {
                $(this).html(templates.SHOW_ALL);
                if (!$panel.visible()) $(window).scrollTo($panel);
                channels[$panel.data("channel-id")].uncollapsed = false;
            } else {
                $(this).html(templates.HIDE);
                channels[$panel.data("channel-id")].uncollapsed = true;
            }
        });

        function onUpdateChannelSelection() {

            var currentDayStart = getDayStart(shownTime);
            var currentDayEnd = getDayEnd(shownTime);
            var filterProgram = function filterProgram(program) {
                return program.stop > currentDayStart && program.start < currentDayEnd && program.stop > shownTime;
            };

            $channelsWrapper.empty();

            var panels = [];

            var _iteratorNormalCompletion = true;
            var _didIteratorError = false;
            var _iteratorError = undefined;

            try {
                var _loop = function _loop() {
                    var channelId = _step.value;


                    var $panel = $(templates.channel(channelId, channels[channelId]));
                    var $programsTable = $panel.find(".timetable");
                    var shownPrograms = 0;
                    panels.push($panel);

                    getPrograms(channelId, function (err, programs) {
                        var _iteratorNormalCompletion3 = true;
                        var _didIteratorError3 = false;
                        var _iteratorError3 = undefined;

                        try {

                            for (var _iterator3 = programs[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
                                var program = _step3.value;

                                if (filterProgram(program)) {
                                    var $program = $(templates.program(program, channelId)).appendTo($programsTable);
                                    if (shownCategory != "general" && program.category != shownCategory) $program.addClass("suppressed");
                                    shownPrograms++;
                                }
                            }
                        } catch (err) {
                            _didIteratorError3 = true;
                            _iteratorError3 = err;
                        } finally {
                            try {
                                if (!_iteratorNormalCompletion3 && _iterator3.return) {
                                    _iterator3.return();
                                }
                            } finally {
                                if (_didIteratorError3) {
                                    throw _iteratorError3;
                                }
                            }
                        }

                        var $showAllBtn = $panel.find(".show-all-btn");
                        if (shownPrograms > 5) {
                            $showAllBtn.html(templates.SHOW_ALL);
                        }
                        $showAllBtn.toggleClass("hidden", shownPrograms <= 5);
                        $panel.find(".no-programs").toggleClass("hidden", shownPrograms != 0);
                    });
                };

                for (var _iterator = $channelsSelect.val()[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                    _loop();
                }

                // build grid for channels
            } catch (err) {
                _didIteratorError = true;
                _iteratorError = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion && _iterator.return) {
                        _iterator.return();
                    }
                } finally {
                    if (_didIteratorError) {
                        throw _iteratorError;
                    }
                }
            }

            for (var i = 0; i <= panels.length; i += 4) {
                //let $row = $("<div class='row'/>");
                var $row = $("<div class='row'/>");
                for (var j = i; j <= Math.min(panels.length, i + 3); j += 2) {
                    var $innerRow = $("<div class='col-xs-12 col-md-6'><div class='row'/></div>");
                    for (var k = j; k <= Math.min(panels.length, j + 1); k++) {
                        $innerRow.find(".row").append(panels[k]);
                    }
                    $row.append($innerRow);
                }
                $channelsWrapper.append($row);
            }

            var _iteratorNormalCompletion2 = true;
            var _didIteratorError2 = false;
            var _iteratorError2 = undefined;

            try {
                for (var _iterator2 = panels[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                    var _$panel = _step2.value;
                    // restore panel collapse state
                    if (channels[_$panel.find(".channel-panel").data("channel-id")].uncollapsed) _$panel.find(".show-all-btn").click();
                }
            } catch (err) {
                _didIteratorError2 = true;
                _iteratorError2 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion2 && _iterator2.return) {
                        _iterator2.return();
                    }
                } finally {
                    if (_didIteratorError2) {
                        throw _iteratorError2;
                    }
                }
            }
        }

        getChannels(function (err, loadedChannels) {
            channels = loadedChannels;
            if (err) {
                displayError();
            } else {
                for (var _channelId in channels) {
                    $channelsSelect.append("<option data-icon=\"" + channels[_channelId].icon + "\" value=\"" + _channelId + "\">" + channels[_channelId].name + "</option>");
                }

                saveRestoreElemState($channelsSelect, "savedChannels");

                if (!$channelsSelect.val()) // if nothing selected, select DEFAULT_SELECTED_CHANNELS
                    $channelsSelect.find("option:lt(" + DEFAULT_SELECTED_CHANNELS + ")").attr('selected', true);

                $channelsSelect.multiselect({
                    enableFiltering: true,
                    filterPlaceholder: 'Поиск...',
                    maxHeight: 500,
                    enableHTML: true,
                    optionLabel: function optionLabel(element) {
                        return "\n                    <img class=\"channel-icon\" src=\"" + $(element).data("icon") + "\"/> \n                    <span class=\"channel-title\">" + $(element).text() + "</span>\n                ";
                    },
                    buttonText: function buttonText() {
                        return "Выберите каналы...";
                    },
                    templates: {
                        filterClearBtn: '<span class="glyphicon glyphicon-remove multiselect-clear-filter"></span>'
                    }
                });
                $channelsSelect.change(onUpdateChannelSelection).change();
            }
        });
    });

}));