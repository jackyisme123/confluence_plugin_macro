var my_message = '';
var model_url = '';
var height = '';
var width = '';
var auto_display = '';

//bind on initialization of editor
AJS.bind("init.rte", function() {
    var macroName = 'insert_3d_model_test';

    // 1. create dialog to add macro
    var dialog = new AJS.Dialog({
        width: 820,
        height: 1200,
        id: "test-dialog",
        closeOnOutsideClick: true
    });

    dialog.addHeader("Test Dialog");

    // hide dialog
    dialog.addCancel("Cancel", function() {
        dialog.hide();
    });


    dialog.addPanel("test","<iframe id = 'test_frame' src ='http://localhost:8080/3dmodels' height='1024' width='780' frameborder='0' scrolling='no' >Browser not compatible.</iframe>\n","my-macro-test");
    function receiveMessage(event)
    {
        // Do we trust the sender of this message?
        if (event.origin !== "http://localhost:8080"){
            console.log('wrong origin');
            return;}
        my_message=event.data;
        var message_parts = my_message.split("@#$%^&*&^%$#@");
        model_url = message_parts[0];
        height = message_parts[1];
        width = message_parts[2];
        auto_display = message_parts[3];
        // if(model_url!=''&&height!=''&&width!=''){
            // dialog.addSubmit("Create Macro", function() {
                var currentParams = {};
                currentParams["url"] = model_url;
                currentParams["height"]=height;
                currentParams["width"]=width;
                currentParams["auto_display"] = auto_display;
                // 3. get current selection in editor
                var selection = AJS.Rte.getEditor().selection.getNode();
                var macro = {
                    name: macroName,
                    params: currentParams,
                    defaultParameterValue: "",
                    body : ""
                };

                // 4. convert macro and insert in DOM
                tinymce.plugins.Autoconvert.convertMacroToDom(macro, function(data, textStatus, jqXHR ) {
                    AJS.$(selection).html(data);
                }, function(jqXHR, textStatus, errorThrown ) {
                    AJS.log("error converting macro to DOM");
                });
                dialog.hide();
            // });
        // }
    }

    window.addEventListener("message", receiveMessage, false);
    // 2. add macro to editor

    // 5. bind event to open macro browser
    AJS.MacroBrowser.setMacroJsOverride(macroName, {opener: function(macro) {
        // open custom dialog
        dialog.show();
        // This will successfully queue a message to be sent to the popup, assuming
        // the window hasn't changed its location.

    }});
});


