"use strict";

import * as Utils from "./utils.js";
import * as API from "./api-client.js"

const DEFAULT_SELECTED_CHANNELS = 5;

const templates = {
    init: function () {
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
    channel: (channelId, channelData) => templates._CHANNEL_TEMPLATE.mapReplace({
        "%CHANNEL_ID%": channelId,
        "%CHANNEL_ICON%": channelData.icon,
        "%CHANNEL_TITLE%": channelData.name
    }),
    program: (programData, channelId) => templates._PROGRAM_TEMPLATE.mapReplace({
        "%PROGRAM_START%": Utils.timeFormat(programData.start),
        "%PROGRAM_TITLE%": programData.title,
        "%PROGRAM_DESCRIPTION%": programData.desc || templates._NO_PROGRAM_DESCRIPTION,
        "%PROGRAM_DESC_ID%": channelId + programData.start.getTime(), // generate unique id for program in DOM
        "%PROGRAM_CATEGORY%": programData.category || "Без категории",
        "%PROGRAM_AGE%": programData.ageRestriction,
        "%PROGRAM_CATEGORY_ICON%": templates.categoryIcons[programData.category] || templates.categoryIcons.general
    }),
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
    categoryOption: category => templates._CATEGORY_OPTION_TEMPLATE.mapReplace({
        "%CATEGORY_NAME%": category == "general" ? "Все категории" : category,
        "%CATEGORY_ICON%": templates.categoryIcons[category] || templates.categoryIcons.general
    })
};

$(function () {

    templates.init();

    const $channelsSelect = $("#channels-select");
    const $categoriesSelect = $("#categories-select");
    const $channelsWrapper = $("#channels-wrapper");

    let shownTime = new Date();
    let shownCategory = "general";

    let channels;

    for (let category in templates.categoryIcons) {
        $categoriesSelect.append(`<option value="${category}">${category}</option>`)
    }

    // enable category selector
    Utils.saveRestoreElemState($categoriesSelect, "savedCategory");
    $categoriesSelect
        .change(() => {
            shownCategory = $categoriesSelect.val();
            if (channels) onUpdateChannelSelection(); //trigger only if channels are loaded
        })
        .change();
    $categoriesSelect.multiselect({
        enableHTML: true,
        optionLabel: element => templates.categoryOption($(element).text()),
        buttonText: (options, select) => templates.categoryOption(select.val())
    });

    // init day tabs
    let todayStart = Utils.getDayStart(new Date());
    $("#today-date").html(Utils.dateFormat(todayStart));
    $("#tommorow-date").html(Utils.dateFormat(Utils.getTomorrow(todayStart)));
    $('#day-tabs a').click(function (e) {
        e.preventDefault();
        $(this).tab('show');

        if ($(this).data("day") == "today") {
            shownTime = new Date();
        } else if ($(this).data("day") == "tomorrow") {
            shownTime = Utils.getTomorrow(Utils.getDayStart(new Date()));
        }

        if (channels) onUpdateChannelSelection(); //trigger only if channels are loaded
    });

    // init show all programs btn
    $(document).on('click', '.show-all-btn', function () {
        let $panel = $(this).closest(".channel-panel");

        $panel.toggleClass("collapsed");
        if ($panel.hasClass("collapsed")) {
            $(this).html(templates.SHOW_ALL);
            if (!$panel.visible())
                $(window).scrollTo($panel);
            channels[$panel.data("channel-id")].uncollapsed = false;
        } else {
            $(this).html(templates.HIDE);
            channels[$panel.data("channel-id")].uncollapsed = true;
        }
    });


    function onUpdateChannelSelection() {

        const currentDayStart = Utils.getDayStart(shownTime);
        const currentDayEnd = Utils.getDayEnd(shownTime);
        const filterProgram = (program) =>
        program.stop > currentDayStart && program.start < currentDayEnd && program.stop > shownTime;

        $channelsWrapper.empty();

        let panels = [];

        for (let channelId of $channelsSelect.val()) {

            let $panel = $(templates.channel(channelId, channels[channelId]));
            let $programsTable = $panel.find(".timetable");
            let shownPrograms = 0;
            panels.push($panel);

            API.getPrograms(channelId, function (err, programs) {

                for (let program of programs) {
                    if (filterProgram(program)) {
                        let $program = $(templates.program(program, channelId))
                            .appendTo($programsTable);
                        if (shownCategory != "general" && program.category != shownCategory)
                            $program.addClass("suppressed");
                        shownPrograms++;
                    }
                }
                let $showAllBtn = $panel.find(".show-all-btn");
                if (shownPrograms > 5) {
                    $showAllBtn.html(templates.SHOW_ALL);
                    $showAllBtn.show();
                } else {
                    $showAllBtn.hide();
                }
                $panel.find(".no-programs").toggleClass("hidden", shownPrograms != 0);
            });
        }

        // build grid for channels
        for (let i = 0; i <= panels.length; i += 4) {
            //let $row = $("<div class='row'/>");
            let $row = $("<div class='row'/>");
            for (let j = i; j <= Math.min(panels.length, i + 3); j += 2) {
                let $innerRow = $("<div class='col-xs-12 col-md-6'><div class='row'/></div>");
                for (let k = j; k <= Math.min(panels.length, j + 1); k++){
                    $innerRow.find(".row").append(panels[k]);
                }
                $row.append($innerRow);
            }
            $channelsWrapper.append($row);
        }

        for (let $panel of panels) { // restore panel collapse state
            if (channels[$panel.find(".channel-panel").data("channel-id")].uncollapsed)
                $panel.find(".show-all-btn").click();
        }
    }

    API.getChannels(function (err, loadedChannels) {
        channels = loadedChannels;
        if (err) {
            Utils.displayError();
        } else {
            for (let channelId in channels) {
                $channelsSelect.append(
                    `<option data-icon="${channels[channelId].icon}" value="${channelId}">${channels[channelId].name}</option>`
                );
            }

            Utils.saveRestoreElemState($channelsSelect, "savedChannels");

            if (!$channelsSelect.val()) // if nothing selected, select DEFAULT_SELECTED_CHANNELS
                $channelsSelect.find(`option:lt(${DEFAULT_SELECTED_CHANNELS})`).attr('selected', true);

            $channelsSelect.multiselect({
                enableFiltering: true,
                filterPlaceholder: 'Поиск...',
                maxHeight: 500,
                enableHTML: true,
                optionLabel: element => `
                    <img class="channel-icon" src="${$(element).data("icon")}"/> 
                    <span class="channel-title">${$(element).text()}</span>
                `,
                buttonText: () => "Выберите каналы...",
                templates: {
                    filterClearBtn: '<span class="glyphicon glyphicon-remove multiselect-clear-filter"></span>'
                }
            });
            $channelsSelect
                .change(onUpdateChannelSelection)
                .change();
        }
    });
});
