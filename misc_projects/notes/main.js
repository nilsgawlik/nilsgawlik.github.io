var defaultText = 
"### Hi there\n" +
"\n" +
"This is a page where you can take notes. \n" +
"\n" +
"The format for these notes is markdown.\n" +
"\n" +
"Everything written here is saved in your browsers local storage. Nothing is saved on the server.\n" +
"\n"
;


window.onload = function() {
    var converter = new showdown.Converter();
    var editButton = document.getElementById("editButton");

    var key = "magicMirrorContent";
    var text = localStorage.getItem(key);
    if (text === null) {
        text = defaultText;
    }
    
    var html = converter.makeHtml(text);

    var content = document.getElementById("content");
    var editor = document.getElementById("editor");

    editor.innerHTML = text;
    content.innerHTML = html;

    // editor.style.visibility = "hidden";
    editor.remove();

    var toggleEditMode = function(e) {
        if(editButton.innerHTML === "edit") {
            editButton.innerHTML = "save";

            content.parentElement.appendChild(editor);
            content.remove();
            // content.style.visibility = "hidden";
            // editor.style.visibility = "visible";
        } else {
            editButton.innerHTML = "edit";

            editor.parentElement.appendChild(content);
            editor.remove();
            // editor.style.visibility = "hidden";
            // content.style.visibility = "visible";

            // save
            text = editor.value;
            localStorage.setItem(key, text);
            html = converter.makeHtml(text);
            content.innerHTML = html;
        }
    };

    editButton.onclick = toggleEditMode;

    editor.onkeypress = function(event) {
        if(event.key === "Enter" && event.ctrlKey) {
            toggleEditMode();
        }
    };
};
