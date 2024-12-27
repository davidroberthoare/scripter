// localstorage namespace
const scripts = store.namespace('scripts');
let script_name = "Untitled";

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
    console.log("saving...", script_name)
    scripts.set(script_name, quill.getContents())
}

// UI LISTENERS

function save(saveAs){
    app.panel.close()
    if(script_name == "Untitled" || saveAs == true){
        app.dialog.prompt("What do you want to call your script?", "Save Script as...", function (name) {
            script_name = name;
            $$("#script_title").text(script_name)
            saveEditorState();
        });
    }else{
        saveEditorState();
    }

}


var script_picker;


function openScript(){
    app.panel.close()
    if(scripts.keys().length==0){
        app.dialog.alert("No saved scripts to open", "Open file?");
        return;
    }

    script_picker = app.picker.create({
        toolbarCloseText: "Open Saved Script",
        cols: [
           {
            textAlign: 'left',
             values: scripts.keys(),
           }
         ],
         on: {
            close: function (picker) {
              console.log('Picker closed', picker)
              script_name = picker.value[0];
              $$("#script_title").text(script_name)
              let ops = scripts.get(script_name)
              quill.setContents(ops);
            }
          }
      });

      script_picker.open();

}

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
    //save document
    if ((window.navigator.platform.match("Mac") ? e.metaKey : e.ctrlKey) && e.key == 's') {
        e.preventDefault();
        save();
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


// // UTILITY FUNCTIONS
// cursor_colors = [
//     "Blue",
//     "Red",
//     "Green",
//     "Purple",
//     "Orange",
//     "Brown",
//     "DarkRed",
//     "DarkBlue",
//     "DarkMagenta",
//     "DarkCyan",
//     "DarkTurquoise",
// ]
// function getColorForUserId(userId) {
//     const colorIndex = userId % cursor_colors.length;
//     return cursor_colors[colorIndex];
// }

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