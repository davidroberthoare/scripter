// custom styles
var Block = Quill.import('blots/block');

// scene
class sceneBlot extends Block { static create() { let node = super.create(); node.setAttribute('class', 'custom'); return node;} }
sceneBlot.blotName = 'scene';
sceneBlot.tagName = 'scene';
Quill.register(sceneBlot);


// action
class actionBlot extends Block { static create() { let node = super.create(); node.setAttribute('class', 'custom'); return node;} }
actionBlot.blotName = 'action';
actionBlot.tagName = 'action';
Quill.register(actionBlot);

// character
class characterBlot extends Block { static create() { let node = super.create(); node.setAttribute('class', 'custom'); return node;} }
characterBlot.blotName = 'character';
characterBlot.tagName = 'character';
Quill.register(characterBlot);

// dialogue
class dialogueBlot extends Block { static create() { let node = super.create(); node.setAttribute('class', 'custom'); return node;} }
dialogueBlot.blotName = 'dialogue';
dialogueBlot.tagName = 'dialogue';
Quill.register(dialogueBlot);

// parenthetical
class parentheticalBlot extends Block { static create() { let node = super.create(); node.setAttribute('class', 'custom'); return node;} }
parentheticalBlot.blotName = 'parenthetical';
parentheticalBlot.tagName = 'parenthetical';
Quill.register(parentheticalBlot);

// lyrics
class lyricsBlot extends Block { static create() { let node = super.create(); node.setAttribute('class', 'custom'); return node;} }
lyricsBlot.blotName = 'lyrics';
lyricsBlot.tagName = 'lyrics';
Quill.register(lyricsBlot);

// transition
class transitionBlot extends Block { static create() { let node = super.create(); node.setAttribute('class', 'custom'); return node;} }
transitionBlot.blotName = 'transition';
transitionBlot.tagName = 'transition';
Quill.register(transitionBlot);

// pagenum
class pagenumBlot extends Block { static create() { let node = super.create(); node.setAttribute('class', 'custom'); return node;} }
pagenumBlot.blotName = 'pagenum';
pagenumBlot.tagName = 'pagenum';
Quill.register(pagenumBlot);

// titlepage
class titlepageBlot extends Block { static create() { let node = super.create(); node.setAttribute('class', 'custom'); return node;} }
titlepageBlot.blotName = 'titlepage';
titlepageBlot.tagName = 'titlepage';
Quill.register(titlepageBlot);

// notes
class notesBlot extends Block { static create() { let node = super.create(); node.setAttribute('class', 'custom'); return node;} }
notesBlot.blotName = 'notes';
notesBlot.tagName = 'notes';
Quill.register(notesBlot);

// boneyard
class boneyardBlot extends Block { static create() { let node = super.create(); node.setAttribute('class', 'custom'); return node;} }
boneyardBlot.blotName = 'boneyard';
boneyardBlot.tagName = 'boneyard';
Quill.register(boneyardBlot);