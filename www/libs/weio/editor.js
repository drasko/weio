/*
 * ACE Editor, there is only one editor that travels thru DOM space
 * It appears at good strip at good time
 * Only thing that is change is Ace Session inside editor
 */
var editor;


/*
 * Array of opened file names
 * String array of absolut paths
 */
var currentlyOpened = [];


/*
 * When all DOM elements are fully loaded
 */
$(document).ready(function () {
    
    /*
     * left and right sidebar width when opened
     * DON'T MODIFY these parameters thay are hard
     * coded and hardcoded in weio.less file as well
     */ 
    var leftSideBarWidth = "199px";
    var rightSideBarWidth = "495px";

    /*
     * Closed sidebar (left or right) width
     * DON'T MODIFY these parameters thay are hard
     * coded and hardcoded in weio.less file as well
     */
    var closedSideBarWidth = "15px";

    updateConsoleHeight();

    $("#leftSideBarButton").click(function(){

        if ($(this).is(".opened")) {

            $(".editorContainer").animate( { left: closedSideBarWidth }, { queue: false, duration: 100 });

            $(".leftSideBar").animate( { width: closedSideBarWidth }, { queue: false, duration: 100 });
            $("#leftSideBarButton").animate( { left: "-5px"}, { queue: false, duration: 100 });
            $("#leftSideBarButton").attr("class", "closed");
            $("#leftSideBarButton i").attr("class", "icon-chevron-right");
            $(".tree").hide();
            $(".bottomButtons").hide();
            
        } else {

            $(".editorContainer").animate( { left: leftSideBarWidth }, { queue: false, duration: 100 });

            $(".leftSideBar").animate( { width: leftSideBarWidth }, { queue: false, duration: 100 });
            $("#leftSideBarButton").animate( { left: "177px"}, { queue: false, duration: 100 });
            $("#leftSideBarButton").attr("class", "opened");
            $("#leftSideBarButton i").attr("class", "icon-chevron-left");
            $(".tree").show();
            $(".bottomButtons").show();
           
        }
        
        
    });

    $("#rightSideBarButton").click(function(){

        if ($(this).is(".opened")) {

            $(".editorContainer").animate( { right: closedSideBarWidth }, { queue: false, duration: 100 });

            $(".rightSideBar").animate( { width: closedSideBarWidth }, { queue: false, duration: 100 });
            $("#rightSideBarButton").animate( { left: "-5px"}, { queue: false, duration: 100 });
            $("#rightSideBarButton").attr("class", "closed");
            $("#rightSideBarButton i").attr("class", "icon-chevron-left");
            $("#trashConsole").hide();
            

        } else {

            $(".editorContainer").animate( { right: rightSideBarWidth }, { queue: false, duration: 100 });

            $(".rightSideBar").animate( { width: rightSideBarWidth }, { queue: false, duration: 100 });
            $("#rightSideBarButton").animate( { left: "0px"}, { queue: false, duration: 100 });
            $("#rightSideBarButton").attr("class", "opened");
            $("#rightSideBarButton i").attr("class", "icon-chevron-right");
            $("#trashConsole").show();
            
        }
        
            

    });
                
   
    
   //window.setInterval("autoSave()",autoSaveInterval); 
   
                  
  $('.accordion').click(function(e){
                        
        if ($(e.target).hasClass('icon-remove')){
            
            // Get Id from file
            var currentStrip = $($(e.target).parents('.accordion-group')).attr('id');
                        
            var killIndex = $.inArray(currentStrip, currentlyOpened);
                        
            currentlyOpened.splice(currentlyOpened.indexOf(currentStrip),1);

            
                        
                        
            // save editor in safe house before
            $('#codeEditorAce').hide();
            $(".safeHome").html('').append($('#codeEditorAce'));
            
            
            //console.log($(e.target).parents('.accordion-group'), $(e.target).parent('.accordion-group'));
            
            $(e.target).parents('.accordion-group').remove();
        
        }
    });
                  

  // Ace editor creation
  createEditor();
  
    
   //console.log(window.innerHeight); 
   //console.log(editorData.editors.length);
  //window.top.setStatus(null, "Gimme some good code!");
   
}); /* end of document on ready event */


function createEditor(){
    editor = ace.edit("codeEditorAce");
    editor.setTheme("ace/theme/dawn");
    editor.getSession().setMode("ace/mode/javascript");
    editor.setValue("", 0);
    editor.setFontSize("11px");
    
    editor.getSession().setTabSize(4);
    editor.getSession().setUseSoftTabs(true);
    editor.getSession().setUseWrapMode(true);
    editor.setShowPrintMargin(false);
    
    editor.gotoLine(0);
}

function scaleIt(){
    var bigH = $(document).height();
    var hOthers = 0;
    
    var f = bigH - 60 - (38 * $('.accordion-group').length);
    
    // Stavljamo visinu editora
    $('.accordion-inner').height(f-19);
    
    // Resize
    $(editor).resize();
}



$(window).resize(function() {
   
   updateConsoleHeight();
});


function updateConsoleHeight() {
    var viewportHeight = $(window).height();
    $("#consoleOutput").css("height", viewportHeight-60);
}

function play() {
    var rq = { "request": "play"};
    editorSocket.send(JSON.stringify(rq));
}



//EDITOR////////////////////////////////////////////////////////////////////////////////////////////////////////


/**
 * Milliseconds interval for autosave
 */
var autoSaveInterval = 4000;

/**
 * Do I have to autosave project? This is evaluated by on change event from Ace editor
 */
var codeHasChanged = false;


function clearConsole() {
    $('#consoleOutput').empty();
}


/**
 * Save file on the server and close strip. 
 * Strip is destroyed after and new render is applied
 */
function saveAndClose(id) {
    
    var file = {};
    
    for (var editor in editorData.editors) {
        if (editorData.editors[editor].id==id) {
            var obj = editorData.editors[editor];
            file.data = obj.editorJs.getValue();
            file.name = obj.name;
            file.path = obj.path;
            
            // kill element in JSON
            editorData.editors.splice(editor, 1);
            break;
        }
    }
    console.log(file);
    var rq = { "request": "saveFile", "data":file};
    editorSocket.send(JSON.stringify(rq));
    
    renderEditors();
    refreshEditors();
    updateEditorHeight();
}

/**
 * Save all opened files on the server. This is used 
 * when launching play or passing to preview mode
 */
function saveAll() {
    
    var file = {};
    
    for (var editor in editorData.editors) {
        
        var obj = editorData.editors[editor];
        file.data = obj.editorJs.getValue();
        file.name = obj.name;
        file.path = obj.path;
        
        var rq = { "request": "saveFile", "data":file};
        editorSocket.send(JSON.stringify(rq));
    }
}


/**
 * Auto save if there were changes
 */
function autoSave() {
    if (codeHasChanged) saveAll();
    codeHasChanged = false;
}

/*
 * MODAL CREATE NEW FILE
 */
 
/**
 * Stores file type from modal view before creation
 * Default type is html
 */
var newfileType = "html"; // default value if nothing selected

/**
 * Selecting file type from modal view before creation
 * default value has to be html
 */
function setFileType(type) {
    newfileType = type;
    //console.log("file " + type);
}

/**
 * Creates new file into server and opens it inside editor
 */
function createNewFile() {
    // add more key if needed here, like directory etc...
    var name = $("#newFileName").val();
    
    // Checks for strings that are either empty or filled with whitespace
    if((/^\s*$/).test(name)) { 
        alert("I can't make file with empty name!");
    } else {
        
        var data = {
            "name" : name + "." + newfileType,
            "path" : "."
            };
    
        var rq = { "request": "createNewFile", "data" : data};
        editorSocket.send(JSON.stringify(rq));
    }
    
}


var toBeDeleted = ""; // filename to be deleted
function prepareToDeleteFile(filename) {
    $("#myModalDeleteFileLabel").html("Delete " + filename + "?");
    $('#deleteFile').modal('show');
    toBeDeleted = filename;
}

function deleteFile() {
    var rq = { "request": "deleteFile", "path":toBeDeleted};
    editorSocket.send(JSON.stringify(rq));
    toBeDeleted = "";
}

//CALLBACKS////////////////////////////////////////////////////////////////////////////////////////////////////////
/**
 * Define callbacks here and request keys
 * Each key is binded to coresponding function
 */
var callbacksEditor = {
    "getFileTreeHtml" : updateFileTree,
    "status" : updateStatus,
    "stdout" : updateConsoleOutput,
    "stderr" : updateConsoleError,
    "sysConsole" : updateConsoleSys,
    "getFile": insertNewStrip,
    "saveFile": updateStatus,
    "createNewFile": refreshFiles,
    "deleteFile": fileRemoved,
   
}

/*
 * Insterts HTML code for file tree into sidebar
 * Attaches tree event listener
 */
function updateFileTree(data) {
    $("#tree").html(data.data);
    
    // Events for tree
    $('.tree li.file a').click(function(){
       
       // Where we clicked?                       
       var idEl = $('.tree a.fileTitle').toArray().indexOf(this);
       
       // Path extraction                        
       var path = $(this).attr('id');
                               
       // Adding strip if don't exists already
       if ($.inArray(path, currentlyOpened)<0){
                               
           // asks server to retreive file that we are intested in
           var rq = { "request": "getFile", "data":path};
           editorSocket.send(JSON.stringify(rq));
                               
           // It's more sure to add to currentlyOpened array from
           // websocket callback than here in case that server don't answer
       }
   });
    
}

function updateStatus(data) {
    window.top.setStatus(null, data.status);
}

function updateConsoleOutput(data) {
    var stdout = data.data;
    $('#consoleOutput').append(stdout + "<br>");
}

function updateConsoleError(data) {
    var stderr = data.data;
    $('#consoleOutput').append("<a id='stderr'>" + stderr + "<br></a>");
}

function updateConsoleSys(data) {
    var sys = data.data;
    $('#consoleOutput').append("<a id='sys'>" + sys + "<br></a>");
}


function fixedCollapsing(showMe, data) {
    // Open new element and hide others
    
    // Collapse all
    $('.accordion-group').each(function(index, element) {
                               if ($(element).find('.collapse').hasClass('in')){
                               $(element).find('.collapse').collapse('hide');
                               }
                               });
    
    // Hidding inner div
    $(showMe).find('.collapse').on('show', function () {
                               $(showMe).find('.accordion-inner').animate({opacity:0},300,'linear',function(){
                                                                      editor.setValue(data.data.data);
                                                                      editor.getSession().setMode("ace/mode/"+ data.data.type);
                                                                      
                                                                      editor.gotoLine(0);
                                                                      
                                                                      });
                               })
    
    // Showing inner div and inserting editor
    $(showMe).find('.collapse').on('shown', function () {
                               $('#codeEditorAce').appendTo($(showMe).find('.accordion-inner'));
                               scaleIt();
                               $(showMe).find('.accordion-inner').animate({opacity:1},300,'linear');
                               })
    
    // Showing accordion
    $(showMe).find('.collapse').collapse('show');
}

/**
 * Inserts existing editor in new strip if file is on the server
 */ 

function insertNewStrip(data) {

    // it has been already checked if this file already exists
    // so just insert it straight
    
    var title = data.data.name;
    idEl = data.data.id;

    
    // Element
    var el = $('<div />').html('<div class="accordion-heading"><a class="accordion-toggle" data-toggle="collapse" data-parent="#accordion2" href="#'+'acc_'+idEl+'">'+title+'</a><div class="actions"><a role="button" id="closeButton"><i class="icon-remove"></i></a></div></div><div id="'+'acc_'+idEl+'" class="accordion-body collapse"><div class="accordion-inner"></div></div>').addClass('accordion-group').attr("id", data.data.path);
    
    // Add new strip here
    $('#accordion2').append(el);
    
   
    fixedCollapsing(el,data);
    
    
    $('.accordion-toggle').click(function(){
                                 fixedCollapsing(this, data);
                                 });    
 
    // add to array of current opened files
    currentlyOpened.push(data.data.path);
    
    if (currentlyOpened.length == 1){
        $(el).find('.accordion-inner').html('').append($('#codeEditorAce'));
        $('#codeEditorAce').css({'display':'block'});
    }
    
    // Update height
    scaleIt();
     
}

function refreshFiles(data) {
    updateStatus(data);
    // refresh html filetree 
    var rq = { "request": "getFileTreeHtml"};
    editorSocket.send(JSON.stringify(rq));
}

function fileRemoved(data) {
    updateStatus(data);
    // refresh html filetree 
    var rq = { "request": "getFileTreeHtml"};
    editorSocket.send(JSON.stringify(rq));
    
    // delete strip if opened
    filename = data.path;
    fileId = 0;
    // check if file is already opened
    var exists = false;
    for (var editor in editorData.editors) {
        if (filename==editorData.editors[editor].path) {
            exists = true;
            fileId = editorData.editors[editor].id;
            break;
        } else {
            exists = false;
        }
    }
    
    if (exists==true) {
        
        for (var editor in editorData.editors) {
            if (editorData.editors[editor].id==fileId) {
                // kill element in JSON
                editorData.editors.splice(editor, 1);
                break;
            }
        }
        
        renderEditors();
        refreshEditors();
        updateEditorHeight();
    } 
    
    

    
    
}


//////////////////////////////////////////////////////////////// SOCK JS DASHBOARD        
     
/*
 * SockJS object, Web socket
 */
var editorSocket = new SockJS('http://' + location.host + '/editor/editorSocket');
/*
 * On opening of wifi web socket ask server to scan wifi networks
 */
editorSocket.onopen = function() {
    console.log('editor Web socket is opened');
    // get files
    var rq = { "request": "getFileTreeHtml"};
    editorSocket.send(JSON.stringify(rq));
    
    var rq = { "request": "getPlatform"};
    editorSocket.send(JSON.stringify(rq));
};

/*
 * Dashboard parser, what we got from server
 */
editorSocket.onmessage = function(e) {
    //console.log('Received: ' + e.data);

    // JSON data is parsed into object
    data = JSON.parse(e.data);
    console.log(data);

    // switch
   if ("requested" in data) {
       // this is instruction that was echoed from server + data as response
       instruction = data.requested;  
       if (instruction in callbacksEditor) 
           callbacksEditor[instruction](data);
   } else if ("serverPush" in data) {
          // this is instruction that was echoed from server + data as response
          instruction = data.serverPush;  
          if (instruction in callbacksEditor) 
              callbacksEditor[instruction](data);
          
   }
                 
   
};



editorSocket.onclose = function() {
    // turn on red light if disconnected
    console.log('Dashboard Web socket is closed');
    
};


