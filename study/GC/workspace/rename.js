/**
 * Created by dingguoliang01 on 2015/3/27.
 */
function displayNoteTitle(note) {
    //alert(note.myTitle);
    alert(note['myTitle']);
}
var flowerNote = {test: {
    test: ''
}};
flowerNote.myTitle = 'Flowers';

alert(flowerNote.myTitle);
displayNoteTitle(flowerNote);
window['flowerNote'] = flowerNote;
flowerNote['myTitle'] = flowerNote.myTitle;