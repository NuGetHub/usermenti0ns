// ==UserScript==
// @name         usermenti0ns
// @namespace    pr0
// @version      0.1
// @author       5yn74x
// @match        https://pr0gramm.com/*
// @grant        none
// @require      https://code.jquery.com/ui/1.11.4/jquery-ui.min.js
// ==/UserScript==
var css = `
/* User mentions autocomplete */
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
background-color: #ee4d2e !important;
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

function itemsGet(data) {
    let users = JSON.parse(localStorage.getItem("users")) || {};
    let response = JSON.parse(data);
    response.items.forEach(item => {
        users[item.user] = {mark: item.mark, username: item.user};
    });
    localStorage.setItem("users", JSON.stringify(users));
}

function profileInfo(data) {
    let users = JSON.parse(localStorage.getItem("users")) || {};
    let response = JSON.parse(data);
    users[response.user.name] = {mark: response.user.mark, username: response.user.name}
    localStorage.setItem("users", JSON.stringify(users));
}

function itemsInfo(data) {
    let users = JSON.parse(localStorage.getItem("users")) || {};
    let response = JSON.parse(data);
    response.comments.forEach(comment => {
        users[comment.name] = {mark: comment.mark, username: comment.name};
    });
    localStorage.setItem("users", JSON.stringify(users));
}

function inboxConversations(data) {
    let users = JSON.parse(localStorage.getItem("users")) || {};
    let response = JSON.parse(data);
    response.conversations.forEach(conversation => {
        users[conversation.name] = {mark: conversation.mark, username: conversation.name};
    });
    localStorage.setItem("users", JSON.stringify(users));
}

function initAutocomplete() {
    var availableUsers = Object.values(JSON.parse(localStorage.getItem("users"))).map(({username}) => username);

    $.widget( "custom.superAutocomplete", $.ui.autocomplete, {
        _renderItem: function( ul, item ) {
            let user = JSON.parse(localStorage.getItem("users"));
            let mark = (user[item.label] === undefined)? "0" : user[item.label].mark;
            return $( "<li>" )
                .attr( "data-value", item.value )
                .append(`<span class='user um${mark}'>${item.label}</span>`)
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
            var term = request.term,
                results = [];
            if (term.indexOf("@") >= 0) {
                term = request.term.substring(request.term.lastIndexOf("@")).replace("@", "");
                if (term.length > 0) {
                    results = $.ui.autocomplete.filter(
                        availableUsers, term);
                } else {
                    results = ['NUTZERNAME'];
                }
            }
            response(results);
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
    var catchXHR = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function() {
        this.addEventListener('load', function() {
            if (this.responseURL.search(/items\/get/gm) !== -1) {
                itemsGet(this.response);
            }

            if (this.responseURL.search(/profile\/info/gm) !== -1) {
                profileInfo(this.response);
            }

            if (this.responseURL.search(/items\/info/gm) !== -1) {
                itemsInfo(this.response);
            }

            if (this.responseURL.search(/inbox\/conversations/gm) !== -1) {
                inboxConversations(this.response);
            }

        });
        catchXHR.apply(this, arguments);
    };

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




