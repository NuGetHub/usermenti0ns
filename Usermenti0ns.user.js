// ==UserScript==
// @name         usermenti0ns
// @namespace    pr0
// @version      1.0.1
// @author       5yn74x
// @match        https://pr0gramm.com/*
// @grant        none
// @require      https://code.jquery.com/ui/1.11.4/jquery-ui.min.js
// ==/UserScript==
var css = `
.ui-autocompletem {
position: relative;
display: inline-block;
}

.ui-autocomplete {
position: absolute;
border: 2px solid #2a2e31;
border-top: none;
z-index: 99;
padding: 0;
list-style-type: none;
max-height: 195px;
overflow-y: scroll;
}

.ui-autocomplete li {
padding: 10px;
cursor: pointer;
color: #f2f5f4;
background: #161618;
//border-bottom: 1px solid #2a2e31;
}

.ui-state-focus {
background-color: var(--theme-main-color) !important;
color: #ffffff;
}

.ui-autocomplete::-webkit-scrollbar {
width: 6px;
}
.ui-autocomplete::-webkit-scrollbar-track {
background: #161618;
}
.ui-autocomplete::-webkit-scrollbar-thumb {
background: var(--theme-secondary-color);
}
.ui-autocomplete::-webkit-scrollbar-thumb:hover {
background: #4444;
}
`;

function getUserSuggestions(prefix) {
    return new Promise((resolve, reject) => {
        let xhr = new XMLHttpRequest();
        xhr.withCredentials = true;

        xhr.addEventListener("readystatechange", function () {
            if (this.readyState === 4) {
                if (this.status === 200) {
                    resolve(JSON.parse(this.responseText));
                } else {
                    reject(this);
                }
            }
        });

        xhr.open("GET", `https://pr0gramm.com/api/profile/suggest?prefix=${prefix}`);
        xhr.setRequestHeader("Accept", "application/json");
        xhr.send();
    });
}

function initAutocomplete() {
    $.widget( "custom.superAutocomplete", $.ui.autocomplete, {
        _renderItem: function( ul, item ) {
            return $( "<li>" )
                .attr( "data-value", item.value )
                .append(`<span>${item.label}</span>`)
                .appendTo( ul );
        }
    });

    $("textarea")
        .bind("keydown", function(event) {
        if (event.keyCode === $.ui.keyCode.TAB && $(this).data("autocomplete").menu.active) {
            event.preventDefault();
        }
    }).superAutocomplete({
        minLength: 0,
        source: function(request, response) {
            var term = request.term;
            if (term.indexOf("@") >= 0) {
                term = request.term.substring(request.term.lastIndexOf("@")).replace("@", "");
                getUserSuggestions(term).then(res => {
                    response(res.users);
                }).catch(console.error);
            }
        },
        focus: function(event, ui) {
            return false;
        },
         select: function(event, ui) {
            let val = this.value;
            this.value = this.value.replace(val.substring(val.lastIndexOf("@")), "@" + ui.item.value)
            return false;
        }
    });
}

(function() {
    document.querySelector('body').addEventListener('click', function(event) {
        if (event.target.tagName.toLowerCase() === 'textarea') {
            initAutocomplete();
        }
    });

    document.querySelector('body').addEventListener('keyup', function(event) {
        if (event.target.tagName.toLowerCase() === 'textarea') {
            initAutocomplete();
        }
    });

    let head, style;
    head = document.getElementsByTagName('head')[0];
    if (!head) { return; }
    style = document.createElement('style');
    style.type = 'text/css';
    style.innerHTML = css;
    head.appendChild(style);
})();
