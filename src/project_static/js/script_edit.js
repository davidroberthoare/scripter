//SCRIPT EDITING FUNCTIONS




Quill.register('modules/cursors', QuillCursors);

// Constant to simulate a high-latency connection when sending cursor
// position updates.
const CURSOR_LATENCY = 0; //1000;
// Constant to simulate a high-latency connection when sending
// text changes.
const TEXT_LATENCY = 0; //500;


let options = {
    theme: 'snow',
    modules: {
        cursors: {
            transformOnTextChange: true,
        },
        toolbar: {
            container: "#quill-toolbar"
        }
    },
    formats: [
        'bold',
        'italic',
        'scene',
        'action',
        'character',
        'dialogue',
        'parenthetical',
        'lyrics',
        'transition',
        'pagenum',
        'titlepage',
        'notes',
        'boneyard',
    ]
}
const quill = new Quill('#editor', options);


// fetch('/static/_OLD/sample_script2.txt')
//     .then(response => response.text())
//     .then(data => {
//         console.log("got default script data")
//         let dataObj = JSON.parse(data);
//         quill.setContents(dataObj);
//     })
//     .catch(error => {
//         console.error('Error:', error);
//     });



const cursors = quill.getModule('cursors');


// SETUP WebSocket CONNECTION & EVENTS
const scriptSocket = new WebSocket('wss://' + window.location.host + '/ws/script/' + script_id + '/')
scriptSocket.onopen = function (e) {
    console.log('WebSocket connection established', e);
    // Add your logic here for handling the connection establishment
    $$('#status1').text('CONNECTED')
};

scriptSocket.onmessage = function (e) {
    const data = JSON.parse(e.data)
    // console.log('ws onMessage', data)

    // if it's a state update
    if (data.state) {
        // load state into editor
        if (data.state.text) {
            console.log("loading editor with state", data.state.text)
            quill.setContents(JSON.parse(data.state.text));
        }

        if (data.state.connected_users) {
            console.log('connected_users', data.state.connected_users)
            let usernames = []
            for (const u of data.state.connected_users) {
                console.log("users connected", u)
                usernames.push(u.username)  // just use to display usernames below

                // create the cursors for as many users are connected
                cursors.createCursor(u.id, u.username, getColorForUserId(u.id));
            }
            $$('#status2').text(usernames.join(", "))
        }
    }
    // if we receive a text-change message with a delta, update the editor
    else if (data.type == "text_change" && data.delta) {
        quill.updateContents(data.delta);
    }
    // if we receive a text-change message with a delta, update the editor
    else if (data.type == "selection_change" && data.range) {
        cursors.moveCursor(data.userid, data.range)
    }
    else {
    }
}

scriptSocket.onclose = function (e) {
    console.error('Script socket closed unexpectedly', e)
    $$('#status1').text('DISCONNECTED: Please reload page.')
}





// CURSORS (synchronization functions from within the quill editors)


quill.on('text-change', function (delta, oldContents, source) {
    // console.log("text changed", delta, oldContents, source)
    if (source === 'user') {
        // quill.updateContents(delta);
        if (scriptSocket && scriptSocket.readyState == scriptSocket.OPEN) {
            scriptSocket.send(JSON.stringify({
                'type': 'text_change',
                'delta': delta
            }));
        }
    }
});

const sendUpdatedSelection = debounce((range) => {
    scriptSocket.send(JSON.stringify({
        'type': 'selection_change',
        'userid': user_id,
        'range': range
    }))
}, 500);

quill.on('selection-change', function (range, oldRange, source) {
    // console.log("selection changed", range, oldRange, source)
    if (source === 'user') {
        if (scriptSocket && scriptSocket.readyState == scriptSocket.OPEN) {
            sendUpdatedSelection(range);
        }
    }
});

function debounce(func, delay) {
    let timeoutId;
    return function (...args) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
            func.apply(this, args);
        }, delay);
    };
}


function saveEditorState() {
    if (is_owner == true) {

        scriptSocket.send(JSON.stringify({
            "type": "save_cmd",
            "text": JSON.stringify(quill.getContents())
        }));
        let toast = app.toast.create({
            text: 'Saved',
            position: 'top',
            closeTimeout: 1000,
            closeButton: true
        });
        toast.open()
    } else {
        console.log("NOT the owner")
    }
}

// UI LISTENERS
$$("#save_btn").click(function () {
    saveEditorState();
})

$$("#rename_btn").click(function () {
    app.dialog.prompt("What do you want to call your script?", "Rename Script?", function (name) {
        console.log("renaming script with name", name)
        API({
            endpoint: "script/" + script_id + "/rename",
            params: { name: name },
            type: "GET",
            success_callback: function (api_response) {
                console.log("success!", api_response);
                script_name = name;
            },
            error_callback: function () {
                var toast = app.toast.create({
                    text: "Whoops! Error with that request. Please try again...",
                    position: 'center',
                    closeTimeout: 2000,
                    destroyOnClose: true
                }).open()
            }
        });
    }, null, script_name)
})


quill.on('text-change', (delta, oldDelta, source) => {
    if (source == 'user') {
        // console.log('A user action triggered this change.', delta, oldDelta);
        if (delta.ops.length >= 2 && ("insert" in delta.ops[1]) && delta.ops[1]["insert"] == "\n") {
            console.log("new line")
            quill.once('editor-change', () => {
                // Trigger your event here
                // console.log('Ops have been applied');
                let thisLine = quill.getLine(quill.getSelection().index)[0]
                // let prevLine = thisLine.prev
                // console.log("this and previous format", thisLine, prevLine)

                // if it's just a blank newline, then adjust it's format
                if(typeof thisLine.children.head.text == "undefined"){

                    let newFormat = "action";
                    if(thisLine instanceof characterBlot) newFormat="dialogue";
                    else if(thisLine instanceof dialogueBlot) newFormat="character";
                    else if(thisLine instanceof actionBlot) newFormat="character";
                    else if(thisLine instanceof sceneBlot) newFormat="action";
                    else if(thisLine instanceof parentheticalBlot) newFormat="dialogue";
                    else if(thisLine instanceof transitionBlot) newFormat="scene";
                    
                    // format the new line using the chosen type based on the previous line
                    quill.formatLine(quill.getSelection().index, 1, newFormat, true);
                }
            });
        }
    }
});

document.addEventListener("keydown", function (e) {
    // console.log("keyEvent", e)

    // // catch 'enter' events and change style depending on current
    // if(e.key="Enter"){
    //     let thisLine = quill.getLine(quill.getSelection().index)[0]
    //     let prevLine = thisLine.prev[0]
    //     console.log("this and previous format", thisLine, prevLine)
    // }

    //save document
    if ((window.navigator.platform.match("Mac") ? e.metaKey : e.ctrlKey) && e.key == 's') {
        e.preventDefault();
        saveEditorState();
    }

    // control-key listeners for style changes
    if (e.altKey) {
        e.preventDefault();

        if (e.key == 's') { quill.formatLine(quill.getSelection().index, 1, 'scene', true); }
        else if (e.key == 'a') { quill.formatLine(quill.getSelection().index, 1, 'action', true); }
        else if (e.key == 'c') { quill.formatLine(quill.getSelection().index, 1, 'character', true); }
        else if (e.key == 'd') { quill.formatLine(quill.getSelection().index, 1, 'dialogue', true); }
        else if (e.key == 'p') { quill.formatLine(quill.getSelection().index, 1, 'parenthetical', true); }
        else if (e.key == 't') { quill.formatLine(quill.getSelection().index, 1, 'transition', true); }
        else if (e.key == 'n') { quill.formatLine(quill.getSelection().index, 1, 'notes', true); }
        else if (e.key == 'l') { quill.formatLine(quill.getSelection().index, 1, 'lyrics', true); }
        else if (e.key == 'b') { quill.formatLine(quill.getSelection().index, 1, 'boneyard', true); }
    }

}, false);

function getCurrentLineNum() {
    const cursorPosition = quill.getSelection().index;
    const line = quill.getText().substr(0, cursorPosition).split('\n').length;
    console.log(`Cursor is on line ${line}`);
    return line;
}


// UTILITY FUNCTIONS
cursor_colors = [
    "Blue",
    "Red",
    "Green",
    "Purple",
    "Orange",
    "Brown",
    "DarkRed",
    "DarkBlue",
    "DarkMagenta",
    "DarkCyan",
    "DarkTurquoise",
]
function getColorForUserId(userId) {
    const colorIndex = userId % cursor_colors.length;
    return cursor_colors[colorIndex];
}

function findCursorPosition() {
    let selection = window.getSelection();
    if (selection.type != 'None') {
        let range = selection.getRangeAt(0);
        let rect = range.getBoundingClientRect();
        console.log("cursor at", rect); // Get position
        return rect;
    } else {
        return { top: 200, left: 100 }   //default position for no selection
    }
}

function test() {
    let rect = findCursorPosition();
    let testbox = $$("<div id='testbox'>test</div>");
    testbox.css({ top: (rect.top - 20) + "px", left: rect.left + "px", position: "absolute", width: "100px", height: "20px", "background-color": "red", "z-index": 99 })
    $$(".page").append(testbox);
    console.log("testbox", testbox)
}