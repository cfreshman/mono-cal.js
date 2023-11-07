// mono-cal.js 0.0.1 @ https://freshman.dev/lib/2/mono-cal/script.js https://freshman.dev/copyright.js
Object.entries({
    'common.js': '/lib/2/common/script.js',
}).map(([key,src])=>!window[key]&&document.head.append((x=>Object.assign(x,{innerHTML:(src=>(x=>{x.withCredentials=false;x.open('GET',src,false);x.send();return x.responseText})(new XMLHttpRequest()))(new URL(src,location.port==='3030'/*local testing on port 3030*/?location.origin:'https://freshman.dev').toString())}))(document.createElement('script'))))
;{
const names = lists.of('mono-cal.js mono_cal')
if (names.some(name => !window[name])) {
const version = `mono-cal.js v0.0.1`
const log = named_log(version)
const definition = (() => {

    /* mono_cal definition
    */
    const today = new Date()
    let months = 'Jan Feb Mar Apr May Jun Jul Aug Sep Oct Nov Dec'.split(' ')

    const Entry = class {
        constructor({
            date,
            func,
            img,
            text,
            color,
            classes,
            invert,
        }) {
            Object.assign(this, {date,func,img,text,color,classes,invert})
        }
    }

    return {
        Entry,
        attach: (root, entries=[], {
            horizontal=false,
            delta=0, absolute=undefined,
            history=true,
            show_toggle=true,
        }={}) => {
            const prev_calendar = Q(root, '.calendar')
            let scrolls
            if (prev_calendar) {
                scrolls = [prev_calendar.scrollTop, prev_calendar.scrollLeft]
            }
            root.innerHTML = `
<div class="calendar-container">
    <style>

.calendar-container {
    flex-grow: 1;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    border: 1px solid #000;
    width: -webkit-fill-available;
    max-width: 100%;
    height: 100%;
    position: relative;
    .calendar-toggle {
        position: absolute;
        bottom: 100%;
        right: 0;
        margin-bottom: 2px;
    }
    .calendar {
      overflow-y: auto;
      display: flex;
      flex-wrap: wrap;
      flex-direction: row;
      padding: .2em;
      margin: 0;
      max-width: 100%;
  
      .scroller {
        max-width: 25em;
        padding-right: 2.25em;
        display: flex;
        flex-wrap: wrap-reverse;
        flex-direction: row-reverse;
      }
      flex-direction: row-reverse;
      justify-content: start;

      .week {
        width: 100%;
        display: flex;
        flex-direction: row-reverse;
        justify-content: start;
      }
      .date {
        min-width: calc((100% - .3em * 7) / 8);
        aspect-ratio: 1/1;
        // margin: .3em .2em .1em .2em;
        margin: .15em;
        border-radius: .2em;
        padding: .15em;
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        justify-content: space-between;
        user-select: none;
        &:nth-child(7n - 6) {
            margin-right: calc((100% - .3em * 7) / 8);
        }
        &.spacer {
        }
        &:not(.spacer) {
          // border: 2px solid #00000022;
          // border: .12em solid #00000022;
        //   box-shadow: 1px 1px 2px 1px #00000022;
          box-shadow: 0px 2px 4px 1px #00000022;
          border: .1em solid #000;
          background: #0000000d;
          &.odd {
            background: #00000019;
          }
          &.invert {
            background: #000;
            color: #fff;
          }
        }
    
        &.func {
          cursor: pointer;
        }
        
        font-size: 1em;
        color: #000000dd;
        &.tally, &.entry-mode {
          background: #0175ff !important;
          color: white;
        }
  
        &.img .date-date {
          background: black;
          color: white;
          border-radius: 2px;
          padding: 0 .2em;
        }
  
        .date-text {
          font-size: .67em;
          max-width: -webkit-fill-available;
          display: inline-block;
          overflow: hidden;
          vertical-align: bottom;
          white-space: pre;
        }
    
        position: relative;
        .month {
          color: #000000dd;
          position: absolute;
          width: 0;
          right: -.5em;
          top: 0;
        }
      }
      &.entry-mode {
        .tally:not(.entry-mode) {
          background: #0175ff66 !important;
        }
      }
    }

    &.horizontal {
        .calendar {
            flex-direction: row;
            flex-wrap: nowrap;
            overflow-x: auto;
            height: 100%;
            max-height: 20em;
            direction: rtl;
            .week {
                direction: ltr;
                width: unset;
                height: 100%;
                flex-direction: column-reverse;
                .date {
                    min-width: unset;
                    min-height: calc((100% - .3em * 7) / 8);
                    max-height: calc((100% - .3em * 7) / 8);
                    max-width: calc(100vw / 8);
                    &:nth-child(7n - 6) {
                        margin-right: 0;
                        margin-bottom: calc((100% - .3em * 7) / 8);
                    }
                    .month {
                        top: 100%;
                        left: 0;
                        width: max-content;
                    }
                }
            }
        }
    }
}
    </style>
    <div class="calendar">
    </div>
    ${show_toggle ? `
    <button class="calendar-toggle">
        <!-- https://www.svgrepo.com/svg/334884/right-arrow-square -->
        <svg fill="#000000" width="1em" height="1em" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M3 5v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2zm4 6h5V7l5 5-5 5v-4H7v-2z"/></svg>
    </button>` : ''}
</div>`
            const calendar_container = Q(root, '.calendar-container')
            if (show_toggle) Q(calendar_container, '.calendar-toggle').onclick = () => calendar_container.classList.toggle('horizontal')
            calendar_container.classList.toggle('horizontal', horizontal)
            const calendar = Q(calendar_container, '.calendar')

            const calendar_dates = (() => {
                let result = []
                let date = today.getDate()
                let min_date = Math.min(...entries.map(x => Number(x.date)))
                let days_since_start = Math.max(
                    absolute ? Math.ceil((Date.now() - absolute) / datetime.duration({ d:1 })) : 729,
                    Math.ceil((Date.now() - min_date) / (duration({ d: 1 })))
                    )
                let count = (history === true ? days_since_start + today.getDay() : history || 0) + delta + 1
                for (let i = 0; i < count; i++) {
                  let day = new Date()
                  day.setDate(date + delta - i)
                  result.push(day)
                }
                return result
            })()

            const date_entries = (() => {
                const result = {}
                entries?.filter(truthy).map(x => {
                    x.invert = x.invert || (x.func && !x.color)
                    result[datetime.ymd(x.date)] = x
                })
                return result
            })()

            log({ calendar_dates, date_entries })

            // pre-spacer
            range(6 - (calendar_dates[0] || today).getDay())
            .map(i => calendar.append(node(`<div class="date spacer"></div>`)))

            calendar_dates.map((date, i) => {
                let date_str = datetime.ymd(date)
                const entry = date_entries[date_str]

                let text_color_rule = ''
                if (entry?.color) {
                    const test_node = node(`<div style="background-color:${entry?.color}">test</div>`)
                    document.body.append(test_node)
                    const css_rgb = getComputedStyle(test_node)['background-color']
                    test_node.remove()
                    const rgb = css_rgb.slice(4, -1).split(', ').map(Number)
                    text_color_rule = (maths.sum(rgb) < 256) ? 'color: #fff;' : ''
                }

                const date_l = node(`
                <div class="date ${entry 
                    ? [
                        entry.classes || '',
                        date.getMonth()%2 ? 'odd' : '',
                        entry?.img ? 'img' : '',
                        entry?.func ? 'func' : '',
                        entry?.invert ? 'invert' : '',
                    ].filter(x=>x).join(' ')
                    : ''}"
                    style="${
                        !entry
                        ? (
                            date_str === datetime.ymd(today)
                            ? `
                            background-color: black;
                            color: white;
                            `
                            : '')
                        : entry?.img
                        ? `
                        background-image: url(${entry.img});
                        background-size: 100%;
                        background-position: center;
                        background-repeat: no-repeat;
                        ` 
                        : `
                        ${entry?.color ? `
                        background: ${entry.color};
                        ${text_color_rule}
                        ` : ''}
                        `
                    }"
                    >
                        <span class="date-date">${date.getDate()}</span>
                        ${entry?.text
                        ? typeof(entry.text) === 'object' ? entry.text : `<span class='date-text'>${entry.text}</span>`
                        : ''}
                        ${date.getDay() === 6 && date.getDate() < 8
                        ? `<div class='month'>
                            ${date.getMonth() === 0
                            ? `
                            <b>${date.getFullYear()}</b>
                            <br />
                            ${months[date.getMonth()]}`
                            : `
                            ${months[date.getMonth()]}
                            ${new Date().getFullYear() !== date.getFullYear()
                                ? `
                                <br />
                                <span>${date.getFullYear()}</span>
                                `
                                : ''}
                            `}
                        </div>`
                        : ''}
                    </div>
                `)
                date_l.onclick = entry?.func ? e => entry?.func(e) : undefined
                calendar.append(date_l)
            })

            // post-spacer
            range((calendar_dates.at(-1) || today).getDay())
            .map(i => calendar.append(node(`<div class="date spacer"></div>`)))

            // re-organize into weeks
            const days = list(calendar.children)
            range(Math.ceil(days.length / 7)).map(w => {
                const week = node('<div class="week"></div>')
                range(7).map(d => week.append(days.shift()))
                calendar.append(week)
            })

            // re-scale font
            const resize = () => {
                if (devices.is_mobile) return
                const date_label = Q(calendar, '.date-date')
                if (date_label) {
                    const scrolls = [calendar.scrollTop, calendar.scrollLeft]
                    let font_size = 0
                    do {
                        calendar.style['font-size'] = (font_size += 1) + 'px'
                    } while (date_label.clientHeight < calendar.clientWidth / (8 * 4))
                    calendar.scrollTop = scrolls[0]
                    calendar.scrollLeft = scrolls[1]
                }
            }
            on(window, 'resize deviceorientation', resize)
            resize()

            if (prev_calendar) {
                calendar.scrollTop = scrolls[0]
                calendar.scrollLeft = scrolls[1]
            }
        },
    }
})()
names.map(name => window[name] = merge(definition, {version, [name]:version, t:Date.now()}))
}
}
