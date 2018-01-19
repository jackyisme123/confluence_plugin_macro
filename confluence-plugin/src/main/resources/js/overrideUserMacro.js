var jsOverrides = {
    "fields" : {
        "string" : function(params, options){ // "string" is the field type
            if (params && params.name != "URL") {
                console.log("11111111111111111111")
                return AJS.MacroBrowser.ParameterFields["string"](params, options);
            }

            var paramDiv = $(Confluence.Templates.MacroBrowser.macroParameterSelect());
            var $select = $("select", paramDiv);
            $(["a, b, c", "d, e, f"]).each(function() {
                $select.append(AJS.$("<option/>").attr("value", this).html("" + this));
            });

            var field = AJS.MacroBrowser.Field(paramDiv, input, options);

        }
    }
};
AJS.MacroBrowser.setMacroJsOverride("insert_3d_model_test", jsOverrides);

AJS.MacroBrowser = AJS.MacroBrowser || {};
(function($) {
    var jsOverrides = {}; // todo pending remove this private member. instance approach?
    var loadMacroMetadataPromise;
    function onGoingPreloadRequest() {
        return loadMacroMetadataPromise &amp;&amp; loadMacroMetadataPromise.state() === "pending";
    }
    /**
     *
     * @param metadata
     * @param mode
     */
    var fetchMetaDataAndLoadMacro = function(metadata, mode) {
        var options = {
            id: metadata.macroName,
            successCallback: function (data) {
                if(data &amp;&amp; data.details) {
                    data.details = AJS.MacroBrowser.Model.transformMetaDataDefault(data.details);
                }
                AJS.MacroBrowser.Editor.loadMacroInBrowser(data.details, mode);
                fetchMetaDataAndLoadMacro.displayDetails();
                AJS.MacroBrowser.Preview.previewMacro(data.details);
            },
            errorCallback: function (err) {
                AJS.trigger("analytics", {name: "macro-browser.fetch-metadata-error"});
                alert(AJS.I18n.getText("macro.browser.load.error.message"));
                fetchMetaDataAndLoadMacro.displayDetails();
            }
        };
        if (metadata.alternateId){
            options.alternateId = metadata.alternateId;
        }
        fetchMetaDataAndLoadMacro.setUI(mode, metadata.title);
        AJS.MacroBrowser.Rest.fetchMacroMetadataDetails(options);
    };
    fetchMetaDataAndLoadMacro.setUI = function(mode, title) {
        var placeHolderTitle = mode=="edit" ? t.editTitle : t.insertTitle;
        $("#macro-insert-container").hide();
        AJS.MacroBrowser.UI.updateButtonText(mode);
        AJS.MacroBrowser.UI.enableSaveButton(false);
        AJS.MacroBrowser.dialog.gotoPage(1).addHeader(placeHolderTitle.replace(/\{0\}/, title));
        AJS.MacroBrowser.dialog.show();
        AJS.MacroBrowser.UI.showBrowserSpinner(true);
    };
    fetchMetaDataAndLoadMacro.displayDetails = function() {
        AJS.MacroBrowser.UI.showBrowserSpinner(false);
        AJS.MacroBrowser.UI.enableSaveButton(false);
        $("#macro-insert-container").show();
        AJS.MacroBrowser.UI.focusOnMacroDetailsFirstInput();
    };
    var t = AJS.MacroBrowser;
    // this is absolutely horrible.
    // we should go with instance objects instead of singleton
    t.reset = function () {
        loadMacroMetadataPromise &amp;&amp; loadMacroMetadataPromise.resolve &amp;&amp; loadMacroMetadataPromise.resolve();
        loadMacroMetadataPromise = null;
        this.initMacroBrowserAfterRequest = null;
        this.initData = null;
        this.hasInit = false;
        this.metadataList = [];
        this.aliasMap = {};
        this.fields = {};
        jsOverrides = {};
        //this.jsOverrides = jsOverrides;
        this.Macros = jsOverrides;
    };
    t.jsOverrides = jsOverrides;
    /**
     * @deprecated Since 3.3. Macros is an ambiguous name, use getMacroJsOverride and setMacroJsOverride.
     */
    t.Macros= jsOverrides;
    t.getMacroJsOverride = function (macroName) {
        return jsOverrides[macroName];
    };
    t.setMacroJsOverride = function (macroName, override) {
        return jsOverrides[macroName] = override;
    };
    t.hasInit = false;
    t.metadataList = [];
    t.aliasMap= {}; // maps each alias to the corresponding macro name
    t.fields= {}; // stores fields for a given macro form.
    /**
     * Checks and returns true if all the required macro parameters have values.
     * It disables the insert/preview buttons if false.
     *
     * @returns {*}
     */
    t.processRequiredParameters = function() {
        return AJS.MacroBrowser.Editor.processRequiredParameters();
    };
    /**
     * Called when a parameter field value changes.
     */
    t.paramChanged = function () {
        // TODO - Could be used to preview?
        AJS.MacroBrowser.Editor.processRequiredParameters();
    };
    // Loads the given macro json in the browser's insert macro page.
    // Exposed to plugins (don't remove)
    t.loadMacroInBrowser = function(metadata, mode) {
        AJS.MacroBrowser.Editor.loadMacroInBrowser (metadata, mode);
    };
    // Constructs the macro markup from the insert macro page
    t.getMacroDefinitionFromForm = function(metadata) {
        AJS.MacroBrowser.Editor.getMacroDefinitionFromForm(metadata);
    };
    /**
     * Returns a Map of all parameter values from the form, including the default parameter value which has a zero
     * length string as a key.
     * @param macroParamDetails meta data about each parameter in the macro
     */
    t.getMacroParametersFromForm = function(macro) {
        AJS.MacroBrowser.Editor.getMacroParametersFromForm(macro);
    };
    // Makes an ajax request to render the macro markup and updates the preview
    // Moved to different namespace. This is just a facade.
    t.previewMacro = function(macro) {
        AJS.MacroBrowser.Preview.previewMacro(macro);
    };
    // This gets called on the preview window's onload to re-adjust the height of the frame
    t.previewOnload = function(body) {
        var selectedMacroName = AJS.MacroBrowser.dialog.activeMetadata.macroName;
        var jsOverride = jsOverrides[selectedMacroName];
        if (jsOverride &amp;&amp; jsOverride.postPreview) {
            jsOverride.postPreview(AJS.$("#macro-preview-iframe")[0], AJS.MacroBrowser.dialog.activeMetadata);
        }
        AJS.Editor.disableFrame(body);
        // open all links in a new window
        $(body).click(function(e) {
            if (e.target.tagName.toLowerCase() === "a") {
                var a = e.target;
                var link = $(e.target).attr("href");
                if (link &amp;&amp; link.indexOf("#") != 0 &amp;&amp; link.indexOf(window.location) == -1) {
                    window.open(link, '_blank').focus();
                }
                return false;
            }
        });
    };
    /**
     * Returns the macro metadata object for a given macro name.
     *
     * Call jsOverride.getMacroDetailsFromSelectedMacro instead of this method for macros such as "gadget" that map
     * multiple macros to a single name.
     *
     * @param macroName macro name to search metadata for
     */
    t.getMacroMetadata = function (macroName) {
        for (var i = 0, len = this.metadataList.length; i &lt; len; i++) {
            var metadata = this.metadataList[i];
            if (metadata.macroName == macroName) {
                return metadata;
            }
        }
        return null;
    };
    /**
     * @since 5.6
     */
    t.getMetadataPromise = function() {
        return loadMacroMetadataPromise;
    };
    /**
     * Called when the user either clicks the Macro Browser button or clicks Edit in a
     * macro placeholder in the RTE.
     *
     * Note that the macro browser is not initialsed/loaded until opened for the first time.
     *
     * @param settings macro browser settings include:
     *      presetMacroMetadata : the metadata for a preset macro to load into the macro browser
     *      selectedHtml : string of selected HTML from RTE when no macro selected
     *      selectedText: the text contents of the selected HTML from the RTE when no macro selected
     *      onComplete : function to call when Macro Browser's "Insert" button is pressed
     *      onCancel : function to call when Macro Browser is closed when incomplete
     *      searchText : text to filter on if opening to the "Select Macro" page, if omitted no filter is done
     *      selectedCategory: the category name that should be selected by default
     */
    t.open = function(settings) {
        if (!settings) {
            settings = {};
            AJS.log("No settings to open the macro browser.");
        }
        var t = AJS.MacroBrowser;
        // if there is a custom editor for this macro, launch that instead
        var macro = settings.selectedMacro;
        if (!macro &amp;&amp; settings.presetMacroMetadata) {
            macro = {
                name: settings.presetMacroMetadata.macroName
            };
        }
        if (macro &amp;&amp; macro.name){
            var jsOverride = t.getMacroJsOverride(macro.name);
            if (jsOverride &amp;&amp; typeof jsOverride.opener == "function"){
                jsOverride.opener(macro);
                return;
            }
        }
        if (!t.hasInit) { // init the macro browser for the first time
            AJS.debug("init macro browser");
            AJS.MacroBrowser.UI.showBrowserSpinner(true);
            if ((t.initData !== null) &amp;&amp; $.isEmptyObject(t.initData)) {
                // the only case where we set initData={} is when we got an error on preloading from the rest endpoint
                // try preloading again..
                AJS.trigger("analytics", {name: "macro-browser.init-reattempt"});
                AJS.logError('Macro browser preload failed. Trying again...');
                t.initMacroBrowserAfterRequest = settings;
                t.preLoadMacro();
                return;
            }
            else if (t.initData) { // preloading completed
                t.initBrowser();
            }
            else { // ajax request not returned yet; set a flag to init the browser later
                AJS.trigger("analytics", {name: "macro-browser.init-overlap"});
                AJS.debug('Waiting for macro browser preloading...');
                t.initMacroBrowserAfterRequest = settings;
                return;
            }
        }
        t.openMacroBrowser(settings);
    };
    /**
     * Open the Macro Browser Dialog, either to a specific macro or the selection page depending on
     * the settings parameter.
     * This method must be called after the dialog has been initialised
     *
     * @param {Object} settings.presetMacroName
     * @param {Object} settings.selectedCategory
     */
    t.openMacroBrowser = function(settings) {
        var t = AJS.MacroBrowser;
        t.settings = settings;
        t.selectedMacroDefinition = settings.selectedMacro;
        var selectedMacroName = (t.selectedMacroDefinition &amp;&amp; t.selectedMacroDefinition.name) ||
            settings.presetMacroName;
        // Preset macro overrides everything, just use it if present
        if (settings.presetMacroName)
            settings.presetMacroMetadata = t.getMacroMetadata(settings.presetMacroName);
        var metadata = settings.presetMacroMetadata;
        if (!metadata) {
            var selectedMacro = settings.selectedMacro;
            if (selectedMacro) {
                // Editing an existing macro - find metadata for it
                selectedMacroName = selectedMacro.name.toLowerCase();
                selectedMacroName = t.aliasMap[selectedMacroName] || selectedMacroName;
                var jsOverride = jsOverrides[selectedMacroName];
                if (jsOverride) {
                    if (typeof jsOverride.updateSelectedMacro == "function") {
                        jsOverride.updateSelectedMacro(selectedMacro);
                    }
                    // Could be a gadget (or other) macro that has a custom metadata lookup function
                    if (typeof jsOverride.getMacroDetailsFromSelectedMacro == "function") {
                        metadata = jsOverride.getMacroDetailsFromSelectedMacro(t.metadataList, selectedMacro);
                    }
                }
                if (!metadata) {
                    metadata = t.getMacroMetadata(selectedMacroName);
                }
            }
        }
        // todo: get a reference to the back button, or create functions to show/hide the button
        // those functions should go on UI?
        var backButton = $("#macro-browser-dialog").find("button.back");
        if (metadata) {
            AJS.debug("Open macro browser to edit macro: "+ metadata.macroName);
            backButton.hide();
            //todo: should we remove this replicateSelectMacro method and use fetchMetaDataAndLoadMacro?
            t.replicateSelectMacro(metadata, settings.mode || "edit");
        }
        // todo: using selectedMacroName var, which is declared above inside an if??
        else if (selectedMacroName) {
            // the user chose to edit a macro but no metadata was available
            backButton.show();
            // todo:  move to UI namespace??
            t.dialog.overrideLastTab();
            t.dialog.gotoPage(2);
            t.showBrowserDialog();
        } else {
            backButton.show();
            if(settings.selectedCategory) {
                // todo: extract category selection to function
                var categoryIndex = $('#select-macro-page .dialog-page-menu button').index($('#category-button-' + settings.selectedCategory));
                if(categoryIndex &lt; 0) {
                    categoryIndex = 0;
                }
                t.dialog.overrideLastTab();
                t.dialog.gotoPanel(0, categoryIndex);
            }
            else {
                t.dialog.gotoPage(0);
            }
            t.showBrowserDialog();
            // If non-blank searchText has been passed in, filter on it
            t.dialog.searcher.focusAndSearch(settings.searchText);
        }
    };
    t.showBrowserDialog = function() {
        AJS.MacroBrowser.dialog.show();
        AJS.MacroBrowser.UI.showBrowserSpinner(false);
    };
    // Called when dialog is closed by Inserting/Saving.
    t.complete = function (dialog) {
        if (!$("#macro-browser-dialog .dialog-button-panel .ok").is(":visible:not(:disabled)")) {
            // If triggered by enter key but not ready to complete, ignore.
            return;
        }
        var t = AJS.MacroBrowser;
        var metadata = t.dialog.activeMetadata;
        var jsOverride = jsOverrides[metadata.macroName];
        if (jsOverride &amp;&amp; jsOverride.manipulateMarkup) {
            jsOverride.manipulateMarkup(metadata);
        }
        var macroDefinition = AJS.MacroBrowser.Editor.getMacroDefinitionFromForm(metadata);
        t.close();
        if (t.settings.onComplete) {
            t.settings.onComplete(macroDefinition);
        }
    };
    /**
     * Called when dialog is closed by various cancel buttons or via Esc key.
     * @returns {boolean}
     */
    t.cancel = function() {
        var t = AJS.MacroBrowser;
        t.close();
        if (typeof t.settings.onCancel == "function") {
            t.settings.onCancel();
        }
        return false;
    };
    t.close = function() {
        var t = this;
        t.unknownParams = {};
        t.fields = {};
        t.dialog.hide();
    };
    /**
     * Replicates the user behaviour of selecting a macro and displaying the insert macro page
     * @param metadata
     * @param mode
     */
    t.replicateSelectMacro = function (metadata, mode) {
        fetchMetaDataAndLoadMacro(metadata, mode);
    };
    /**
     * Loads the categories and macros into the dialog
     * @returns {boolean}
     */
    t.initBrowser = function() {
        var t = AJS.MacroBrowser,
            data = t.initData;
        // 1 . validation
        if (!data.categories || !AJS.MacroBrowser.metadataList.length) {
            AJS.trigger("analytics", {name: "macro-browser.init-browser-error"});
            alert(AJS.I18n.getText("macro.browser.load.error.message"));
            AJS.MacroBrowser.UI.showBrowserSpinner(false);
            return false;
        }
        // 2. Save state
        t.editTitle = data.editTitle;
        t.insertTitle = data.insertTitle;

        // 3. Prepare data
        //--
        // sort the categories and macros
        // Skip the hidden category unless option is set, in which case append it to end of array.
        var hiddenCat;
        data.categories = $.map(data.categories, function (cat) {
            if (cat.name == "hidden-macros") {
                hiddenCat = cat;
                return null;
            }
            return cat;
        });
        data.categories.sort(function(one, two) {
            return (one.displayName.toLowerCase() &gt; two.displayName.toLowerCase() ? 1 : -1);
        });
        if (hiddenCat &amp;&amp; AJS.params.showHiddenUserMacros) {
            data.categories.push(hiddenCat);
        }
        //--

        // 4. Build UI
        t.dialog = AJS.MacroBrowser.UI.createDialog ({
            title: data.title,
            categories: data.categories,
            macros : t.metadataList,
            onClickMacroSummary: function(e, metadata) {
                e.preventDefault();
                fetchMetaDataAndLoadMacro(metadata, "insert");
            },
            onSubmit : t.complete,
            onCancel : t.cancel
        });
        t.hasInit = true;
        return true;
    };
    /**
     * Search macro name, title and description for the given text.
     * @param text (required) text to search on
     * @param options options to pass to the AJS.filterBySearch method
     * @return array of macro summaries matching the search text.
     */
    t.searchSummaries = function (text, options) {
        options = $.extend({
            splitRegex: /[\s\-]+/
        }, options);
        return AJS.filterBySearch(this.metadataList, text, options);
    };
    /**
     * Convenience method to return the macro body. This will be one of -
     * - the text in the body textarea on the macro browser dialog
     * - currently selected text in the editor
     * - the current body if editing an existing macro (disregarding any editor selection)
     * - empty String if neither previous case applies.
     */
    t.getMacroBody = function () {
        var t = AJS.MacroBrowser;
        var body = "";
        if ($("#macro-insert-container .macro-body-div textarea").length) {
            body = $("#macro-insert-container .macro-body-div textarea").val();
        } else if (t.selectedMacroDefinition) {
            if (t.selectedMacroDefinition.body) {
                body = t.selectedMacroDefinition.body;
            }
        } else if (t.dialog.activeMetadata) {
            body = t.dialog.activeMetadata.formDetails.body.content; // this is encoded as appropriate for the current macro
        }
        return body;
    };
    /**
     * Checks if a normally-hidden macro should be displayed in the UI or not.
     * @param macro - a macro summary
     */
    t.isHiddenMacroShown = function (macro) {
        return AJS.params.showHiddenUserMacros &amp;&amp; macro.pluginKey == "_-user-macro-_";
    };
    /**
     * Returns true if the metadata indicates that there are required parameters for this macro
     */
    t.hasRequiredParameters = function (macroMetadata) {
        return macroMetadata.anyParameterRequired;
    };
    /**
     * Provide a CSV of macroNames to include only these macros. Has to be called before preLoadMacro() runs.
     *
     * E.g. "code, cheese"
     *
     * @param whitelist
     */
    t.setWhitelist = function (whitelist) {
        AJS.MacroBrowser.whitelist = whitelist;
    };
    /**
     * Preloads macro metadata
     * @return promise
     */
    t.preLoadMacro = function () {
        var t = AJS.MacroBrowser;
        t.initData = null; // flag async request started
        if (onGoingPreloadRequest()) {
            return loadMacroMetadataPromise;
        }
        loadMacroMetadataPromise = AJS.MacroBrowser.Rest.loadMacroMetadata({
            // todo: currently you can either have a whitelist or drop the details.  Both is to-be-implemented
            data: t.whitelist ? { whitelist: t.whitelist } : { detailed: false },
            successCallback: function(data) {
                t.initData = data;
                AJS.MacroBrowser.Model.loadMacros(data.macros);
                if (t.initMacroBrowserAfterRequest) { // we have an existing "open browser" command in the queue waiting for the preloading operation to complete
                    t.initBrowser();
                    t.openMacroBrowser(t.initMacroBrowserAfterRequest);
                }
            },
            errorCallback: function(e) {
                AJS.trigger("analytics", {name: "macro-browser.preload-error"});
                AJS.logError("Error requesting macro browser metadata:");
                AJS.logError(e);
                t.initData = {}; // empty initData is used as an error flag in the "open" method
            }
        });
    };
})(AJS.$);

/**
 * Namespace to organize common methods related to the macro editor
 */
AJS.MacroBrowser = AJS.MacroBrowser || {};
AJS.MacroBrowser.Editor = (function ($) {
    function loadMacroInBrowser (metadata, mode) {
        if (!metadata || !metadata.formDetails) {
            AJS.trigger("analytics", {name: "macro-browser.unknown-macro-error"});
            alert(AJS.I18n.getText("macro.browser.unknown.macro.message"));
            return;
        }
        var t = AJS.MacroBrowser,
            detail = metadata.formDetails,
            macroName = detail.macroName,
            jsOverride = t.jsOverrides[macroName],
            selectedMacro = t.settings.selectedMacro,
            selectedMacroElement = tinymce.confluence.macrobrowser.editedMacroDiv;
        if (macroName){
            var jsOverride = t.getMacroJsOverride(macroName);
            if (jsOverride &amp;&amp; typeof jsOverride.opener == "function"){
                t.close();
                jsOverride.opener({ name: macroName });
                return;
            }
        }
        $("#save-warning-span").addClass("hidden"); // gadgets may have put it in this state
        // Macro description and documentation link
        $("#macro-insert-container .macro-name").val(macroName);
        var macroDescription = metadata.extendedDescription ? metadata.extendedDescription : metadata.description;
        var macroDesc = $(Confluence.Templates.MacroBrowser.macroDescription({ description: macroDescription })),
            macroParametersForm = $("#macro-insert-container .macro-input-fields form").html(macroDesc);
        if (detail.documentationLink) {
            var doco = $(Confluence.Templates.MacroBrowser.macroDocLink({ href: detail.documentationLink}));
            macroDesc.append(doco);
        } else if (!macroDesc.text()) { // remove the div and its padding style
            macroDesc.remove();
        }
        if (detail.body &amp;&amp; detail.body.bodyType != "NONE" &amp;&amp; (selectedMacroElement &amp;&amp; $(selectedMacroElement).hasClass("editor-inline-macro"))) { // only enable editing of the body in the macro browser for inline body macros
            var pluginKey = metadata.pluginKey;
            if (detail.body.label == AJS.MacroBrowser.Utils.makeDefaultKey(pluginKey, macroName, "body", "label")) {
                detail.body.label = "";
            }
            if (detail.body.description == AJS.MacroBrowser.Utils.makeDefaultKey(pluginKey, macroName, "body", "desc")) {
                detail.body.description = "";
            }
            var body = makeBodyDiv(detail.body, t.selectedMacroDefinition);
            if (body) {
                macroParametersForm.append(body);
            }
        }
        // Parameters may have dependencies so all fields need to be created before values are set.
        $(detail.parameters).each(function() {
            macroParametersForm.append(makeParameterDiv(metadata, this, jsOverride));
        });
        var selectedParams = selectedMacro ? $.extend({}, selectedMacro.params) : {}; // make a copy
        // Fully-implemented macros may have JS overrides defined in a Macro object.
        if (jsOverride &amp;&amp; typeof jsOverride.beforeParamsSet == "function") {
            selectedParams = jsOverride.beforeParamsSet(selectedParams, !selectedMacro);
        }
        $(detail.parameters).each(function() {
            var param = this,
                value;
            if (param.name == "") {
                value = t.selectedMacroDefinition ? t.selectedMacroDefinition.defaultParameterValue : param.defaultValue;
            } else {
                value = selectedParams[param.name];
            }
            if (value != null) {
                delete selectedParams[param.name];
            } else {
                // try looking for aliased parameters
                $(param.aliases).each(function() {
                    if (selectedParams[this]) {
                        value = selectedParams[this];
                        delete selectedParams[this];
                    }
                });
            }
            if (value == null) {
                value = param.defaultValue;
            }
            if (value != null) {
                t.fields[param.name].setValue(value);
            }
        });
        // Any remaining "selectedParameters" are unknown for the current Macro details.
        t.unknownParams = selectedParams;
        // open all links in a new window
        $("a", macroParametersForm).click(function() {
            window.open(this.href, '_blank').focus();
            return false;
        });
        if (!$("#macro-browser-dialog:visible").length) {
            t.showBrowserDialog();
        }
        var macroData = {};
        $.extend(true, macroData, metadata); // clone the metadata to a new object
        // for safety ensure that we have a 'formDetails', containing a body.
        if (!macroData.formDetails) macroData.formDetails = {};
        if (!macroData.formDetails.body) macroData.formDetails.body = {};
        t.dialog.activeMetadata = macroData; // This is important to getMacroBody.
        // do we have have selected text for the macro body or are we editing an existing macro (in which case any selected text is ignored)
        if (t.settings.selectedMacro) {
            macroData.formDetails.body.content = t.settings.selectedMacro.body;
        } else if (macroData.formDetails.body.bodyType &amp;&amp; macroData.formDetails.body.bodyType.toLowerCase() == "plain_text") {
            macroData.formDetails.body.content = t.settings.selectedText;
        } else {
            macroData.formDetails.body.content = t.settings.selectedHtml;
        }
    }
    function getMacroParametersFromForm (metadata) {
        return getMacroDefinitionFromForm(metadata).params;
    }
    function getMacroDefinitionFromForm (metadata) {
        var macroName = $("#macro-insert-container").find(".macro-name").val(); // todo: why don't we get this from the metadata?
        var defaultParameterValue,
            t = AJS.MacroBrowser,
            sharedParameters = {};
        var parameters = getMacroParametersFromFormFields(metadata, sharedParameters);
        if (parameters[""])
            defaultParameterValue = parameters[""];
        $.extend(parameters, t.unknownParams); // apply unknown parameters
        parameters = applyjsOverrides(macroName, parameters, metadata, sharedParameters);
        return {
            name : macroName,
            bodyHtml : t.getMacroBody(),
            params : parameters,
            defaultParameterValue: defaultParameterValue
        };
    }
    function processRequiredParameters() {
        var blankRequiredInputs = $("#macro-insert-container .macro-param-div.required .macro-param-input")
            .filter(function() {
                var val = $(this).val();
                return (val == null || val == "");
            });
        var hasAllRequiredData = (blankRequiredInputs.length == 0);
        var disabled = hasAllRequiredData ? "" : "disabled";
        var classFn = disabled ? "addClass" : "removeClass";
        $("#macro-browser-dialog button.ok").prop("disabled", disabled);
        $("#macro-browser-dialog .macro-preview-header .refresh-link").prop("disabled", disabled)[classFn]("disabled");
        return hasAllRequiredData;
    }

    // private functions
    /**
     * Apply jsOverrides for a macroName
     *
     * @param macroName
     * @param parameters
     * @param macro
     * @param sharedParameters
     * @returns {*} parameters
     */
    function applyjsOverrides(macroName, parameters, macro, sharedParameters) {
        var jsOverride = AJS.MacroBrowser.getMacroJsOverride(macroName);
        if (jsOverride &amp;&amp; typeof jsOverride.beforeParamsRetrieved == "function") {
            parameters = jsOverride.beforeParamsRetrieved(parameters, macro, sharedParameters);
        }
        return parameters;
    }
    /**
     * Get value from the input element according to input type (input text, checkbox, etc)
     * @param $element jQuery input element
     * @returns {*}
     */
    function extractValueFromInputElement($element) {
        var paramVal = $element.val();
        if ($element.attr("type") == "checkbox") {
            paramVal = "" + $element.prop("checked"); //will return 'true' if checked property is not empty
        }
        return paramVal;
    }
    /**
     * Fill parameters and shared parameters according to form values
     * @param metadata
     * @param sharedParameters
     * @returns {{}}
     */
    function getMacroParametersFromFormFields(metadata, sharedParameters) {
        var parameters = {};
        for (var i = 0, l = metadata.formDetails.parameters.length; i &lt; l; i++) {
            var parameter = metadata.formDetails.parameters[i];
            var paramVal = extractValueFromInputElement($("#macro-param-" + parameter.name));
            if (paramVal) {
                // the shared property is used by gadgets in jsOverrides
                if (parameter.shared) {
                    sharedParameters[parameter.name] = paramVal;
                }
                if (parameter.hidden ||
                    (!parameter.defaultValue || parameter.defaultValue != paramVal)) {
                    // only add the parameter value if its not the default
                    parameters[parameter.name] = paramVal;
                }
            }
        }
        return parameters;
    }
    /**
     * Creates a div for a macro body.
     *
     * @param macroBodyFormComponent
     * @param macroDefinition
     * @returns {*|jQuery|HTMLElement}
     */
    function makeBodyDiv (macroBodyFormComponent, macroDefinition) {
        var t = AJS.MacroBrowser,
            bodyDiv = $(Confluence.Templates.MacroBrowser.macroBody()),
            bodyTextareaValue;
        if (macroDefinition) { // we are editing an existing macro
            bodyTextareaValue = macroDefinition.body;
        } else { // check if there is selected text in the editor
            bodyTextareaValue = t.settings.selectedText;
        }
        $("textarea", bodyDiv).val(bodyTextareaValue || "");
        if (macroBodyFormComponent.label) {
            $("label", bodyDiv).text(macroBodyFormComponent.label);
        }
        if (macroBodyFormComponent.description) {
            bodyDiv.append(Confluence.Templates.MacroBrowser.macroParameterDesc({ description: macroBodyFormComponent.description }));
        }
        if(macroBodyFormComponent.hidden) {
            bodyDiv.hide();
        }
        return bodyDiv;
    }
    /**
     * Creates a div for a single macro parameter.
     *
     * @param metadata
     * @param param
     * @param jsOverride
     * @returns {*}
     */
    function makeParameterDiv (metadata, param, jsOverride) {
        var t = AJS.MacroBrowser, field;
        var type = param.type.name;
        // Plugin point - other JS files can define more specific field-builders based on macro name, param name and
        // type.
        if (jsOverride) {
            var builder = jsOverride.fields &amp;&amp; jsOverride.fields[type];
            if (builder &amp;&amp; typeof builder != "function") {
                // Types can be overridden for specific parameters - so the "type" object contains a "name" function.
                builder = builder[param.name];
            }
            if (typeof builder == "function") {
                field = builder.call(jsOverride, param);
            }
        }
        // If no override specific to the macro, look for general overrides specific to the parameter type.
        if (!field) {
            if (!(type in t.ParameterFields &amp;&amp; typeof t.ParameterFields[type] == "function")) {
                type = "string";
            }
            field = t.ParameterFields[type](param);
        }
        t.fields[param.name] = field;
        var paramDiv = field.paramDiv;
        var input = field.input;
        var paramId = "macro-param-" + param.name;
        paramDiv.attr("id", "macro-param-div-" + param.name);
        input.addClass("macro-param-input").attr("id", paramId);
        if (param.hidden) {
            paramDiv.hide();
        }
        // Use param label and desc or correct fallback.
        var pluginKey = metadata.pluginKey;
        if (param.displayName == AJS.MacroBrowser.Utils.makeDefaultKey(pluginKey, metadata.macroName, "param", param.name, "label")) {
            param.displayName = param.name;
        }
        if (param.description == AJS.MacroBrowser.Utils.makeDefaultKey(pluginKey, metadata.macroName, "param", param.name, "desc")) {
            param.description = "";
        }
        var labelText = param.displayName;
        if (param.required) {
            labelText += " *";
            paramDiv.addClass("required");  // set class against div, not input, to allow styling of label if nec
        }
        $("label", paramDiv).attr("for", paramId).text(labelText);
        if (param.description) {
            paramDiv.append(Confluence.Templates.MacroBrowser.macroParameterDesc({ description: param.description }));
        }
        return paramDiv;
    }
    return {
        /**
         * Loads the given macro json in the browser's insert macro page.
         *
         * @param metadata
         * @param mode "insert" or "edit"
         */
        loadMacroInBrowser: loadMacroInBrowser,
        /**
         * Returns a Map of all parameter values from the form, including the default parameter value which has a zero
         * length string as a key.
         * @param metadata meta data about each parameter in the macro
         */
        getMacroParametersFromForm: getMacroParametersFromForm,
        /**
         * Constructs the macro markup from the insert macro page
         *
         * @param {Object} metadata detailed metadata about the macro.  Includes form details etc.
         * @returns {{name: (*|jQuery), bodyHtml: *, params: {}, defaultParameterValue: *}}
         */
        getMacroDefinitionFromForm: getMacroDefinitionFromForm,
        /**
         * Checks and returns true if all the required macro parameters have values.
         * It disables the insert/preview buttons if false.
         *
         * @returns {boolean}
         */
        processRequiredParameters: processRequiredParameters
    };
}(AJS.$));
/**
 * Returns an object wrapper for a parameter-div jQuery object and the input in
 * that div that stores the internal parameter value (as opposed to the display
 * field, although they may be the same).
 */
AJS.MacroBrowser.Field = function (paramDiv, input, options) {
    options = options || {};
    var setValue = options.setValue || function (value) {
        input.val(value);
    };
    var getValue = options.getValue || function () {
        return input.val();
    };

    input.change(options.onchange || AJS.MacroBrowser.paramChanged);
    return {
        paramDiv : paramDiv,
        input : input,
        setValue : setValue,
        getValue : getValue
    };
};
/**
 * ParameterFields defines default "type" logic for fields in the Macro
 * Browser's Insert/Edit Macro form.
 *
 * Each method in this object corresponds to a parameter type as defined in the
 * MacroParameterType enum.
 */
AJS.MacroBrowser.ParameterFields = (function ($) {
    /**
     * Update the dependencies of the identified parameter with the supplied value.
     */
    var updateDependencies = function (paramName, dependencies, value) {
        if (dependencies &amp;&amp; dependencies.length) {
            for ( var i = 0, length = dependencies.length; i &lt; length; i++) {
                AJS.MacroBrowser.fields[dependencies[i]] &amp;&amp; AJS.MacroBrowser.fields[dependencies[i]].dependencyUpdated(paramName, value);
            }
        }
    };
    return {
        "updateDependencies" : updateDependencies,

        "username" : function(param, options) {
            options = options || {};
            var className = param.multiple ? "autocomplete-multiuser" : "autocomplete-user";
            var paramDiv = $(Confluence.Templates.MacroBrowser.macroParameter());
            var input = AJS.$("input[type='text']", paramDiv);
            input.addClass(className).attr("data-none-message", AJS.I18n.getText("macro.browser.smartfields.not.found"));
            // CONF-16859 - check if mandatory params are now filled
            if (param.required) {
                input.keyup(AJS.MacroBrowser.processRequiredParameters);
            }
            if (param.multiple) {
                Confluence.Binder.autocompleteMultiUser(paramDiv);
                options.setValue = function (value) {
                    input.val(value);
                    var values = value.split(','),
                        requests = [],
                        users = [];
                    // unfortunately there is no rest api to get me a list of users, however since its not a common case
                    // to edit macros with multiple users, going to call the existing api for each user
                    for (var i=0,l=values.length; i&lt;l; i++) {
                        var request = function(username) {
                            return $.getJSON(Confluence.getContextPath() + "/rest/prototype/1/user/non-system/" + username)
                                .done(function(user){
                                    if (user &amp;&amp; user.name) {
                                        users.push({id: user.name, text: user.displayName, imgSrc: user.avatarUrl});
                                    }
                                }).fail(function(response) {
                                    AJS.logError("Cannot parse user data for macro browser field with: " + response);
                                    users.push({id: username, text: AJS.I18n.getText("unknown.name",username), imgSrc: Confluence.getContextPath() + "/images/icons/profilepics/default.png"})
                                });
                        };
                        requests.push(request(values[i]));
                    }
                    // wait for all requests to finish, whether they passed/failed and then populate the field value
                    $.when.apply($, _.map(requests, function (aRequest) {
                        var monitor = $.Deferred();
                        aRequest.always(function () {
                            monitor.resolve();
                        });
                        return monitor.promise();
                    })).done(function () {
                        if (users.length) {
                            input.auiSelect2('data', users);
                        }
                    });
                };
            }
            else {
                input.bind("selected.autocomplete-content", function(e, data) {
                    if (options.onselect) {
                        options.onselect(data.selection);
                    }
                    else if(options.setValue) {
                        options.setValue(data.content.username);
                    }
                    else {
                        updateDependencies(param.name, options.dependencies, input.val());
                        (typeof options.onchange == "function") &amp;&amp; options.onchange.apply(input);
                    }
                });
                AJS.Confluence.Binder.autocompleteUserOrGroup(paramDiv);
            }
            return AJS.MacroBrowser.Field(paramDiv, input, options);
        },
        "spacekey" : function(param, options) {
            // for multple space keys just use a String field at the moment
            if (param.multiple) {
                return AJS.MacroBrowser.ParameterFields["string"](param, options);
            }
            options = options || {};
            var paramDiv = $(Confluence.Templates.MacroBrowser.macroParameter());
            var input = AJS.$("input[type='text']", paramDiv);
            input.addClass("autocomplete-space")
                .attr("data-template", "{key}")
                .attr("data-none-message", AJS.I18n.getText("macro.browser.smartfields.not.found"));
            // CONF-16859 - check if mandatory params are now filled
            if (param.required) {
                input.keyup(AJS.MacroBrowser.processRequiredParameters);
            }
            input.bind("selected.autocomplete-content", function(e, data) {
                if (options.onselect) {
                    options.onselect(data.selection);
                }
                else if(options.setValue) {
                    options.setValue(data.content.key);
                }
                else {
                    updateDependencies(param.name, options.dependencies, input.val());
                    (typeof options.onchange == "function") &amp;&amp; options.onchange.apply(input);
                }
            });
            AJS.Confluence.Binder.autocompleteSpace(paramDiv);
            return AJS.MacroBrowser.Field(paramDiv, input);
        },
        "attachment" : function (param, options) {
            if (param.multiple) {
                return AJS.MacroBrowser.ParameterFields["string"](param,
                    options);
            }
            var paramDiv = $(Confluence.Templates.MacroBrowser.macroParameterSelect());
            var input = AJS.$("select", paramDiv);
            options = options || {};
            options.setValue = options.setValue || function(value) {
                // check if the value being set is in the list of options
                // if not then add it as a new option - with an indication that
                // it is not a valid choice for this select box
                var foundOption = false;
                //Don't use a JQuery filter of "[value=" +value+"]" since value is un-escaped user-data
                input.find("option").each(function() {
                    if (this.value == value) {
                        foundOption = true;
                        return false;
                    }
                });
                if (!foundOption) {
                    input.append(AJS.$("&lt;option/&gt;").attr("value", value).text(value + " (" + AJS.I18n.getText("macro.browser.smartfields.not.found") + ")"));
                    input.tempValue = value;
                } else {
                    delete input.tempValue;
                }

                // CONF-15415 : Spurious error thrown in IE6
                try {
                    input.val(value);
                } catch (err) {
                    AJS.logError(err);
                }
                input.change();
            };
            var field = AJS.MacroBrowser.Field(paramDiv, input, options);
            field.updateDependencies = updateDependencies;
            field.getData = function(req) {
                if (!((req.title &amp;&amp; req.spaceKey) || req.pageId || req.draftId)) {
                    AJS.log("Not enough parameters to send attachmentsearch request");
                    return;	// not enough content info to get attachments
                }
                var currentValue = input.tempValue || input.val();
                if (options.fileTypes) {
                    req.fileTypes = options.fileTypes;
                }

                var url = AJS.params.contextPath + (req.draftId ? "/json/draftattachmentsearch.action" : "/json/attachmentsearch.action");
                $.getJSON(url, req, function(data) {
                    if (data.error) {
                        return;
                    }
                    $("option", input).remove();
                    var attachments = data.attachments;
                    // if there are no attachments on the page then populate the options with
                    // a message stating this
                    if (!attachments || !attachments.length) {
                        // AJS.log("attachment - No attachments so creating message. tempValue = " + input.tempValue);
                        input.append(AJS.$("&lt;option/&gt;").attr("value", "").html(AJS.I18n.getText("macro.browser.smartfields.no.attachments")));
                        if (input.tempValue) {
                            options.setValue(input.tempValue);
                        }
                    } else {
                        for (var i = 0, length = attachments.length; i &lt; length; i++) {
                            input.append(AJS.$("&lt;option/&gt;").attr("value", attachments[i].name).text(attachments[i].name));
                        }
                        currentValue = currentValue || input.tempValue;
                        options.setValue(currentValue || attachments[0].name);
                    }
                    //in IE9 only the first character of the selected option is shown, force a redraw
                    input.attr("style", "");
                });
            };
            return field;
        },
        "confluence-content" : function (param, options) {

            // If multiple confluence-content field then only return a String at the moment
            if (param.multiple) {
                return AJS.MacroBrowser.ParameterFields["string"](param, options);
            }
            options = options || {};
            param.options = param.options || {};
            var paramDiv = $(Confluence.Templates.MacroBrowser.macroParameter()),
                input = AJS.$("input[type='text']", paramDiv)
                    .attr("data-none-message", AJS.I18n.getText("macro.browser.smartfields.not.found"))
                    .attr("data-template", ""); // no template as some logic is required to build the value
            // CONF-16859 - check if mandatory params are filled on keypresses in this field.
            if (param.required) {
                input.keyup(AJS.MacroBrowser.processRequiredParameters);
            }
            // CONF-15438 - update any dependencies of the field when it is changed
            options.onchange = options.onchange || function (e) {
                var val = input.val();
                updateDependencies(param.name, options.dependencies, val);
            };
            options.setValue = options.setValue || function (value) {
                input.val(value);
                (typeof options.onchange == "function") &amp;&amp; options.onchange.apply(input);
            };

            input.bind("selected.autocomplete-content", function(e, data) {
                var datePathPrefix = "";
                if (param.options.includeDatePath == "true" &amp;&amp; data.content.type == "blogpost") {
                    var splitDate = data.content.createdDate.date.split("-");
                    datePathPrefix = "/" + splitDate[0] + "/" + splitDate[1]  + "/" + splitDate[2].substring(0, 2) + "/";
                }
                var spaceKey = data.content.space &amp;&amp; data.content.space.key;
                var isSpaceKeyNeeded = (spaceKey &amp;&amp; spaceKey != AJS.Meta.get('space-key'));
                if (data.content.title.indexOf(":") != -1) {
                    isSpaceKeyNeeded = true;
                }
                var markup = (isSpaceKeyNeeded ? (spaceKey + ":") : "") + datePathPrefix + data.content.title;
                input.val(markup);
                if (options.onselect) {
                    options.onselect(data.selection);
                }
                else {
                    options.setValue(markup, input);
                }
            });
            if (param.options.spaceKey) {
                if (param.options.spaceKey.toLowerCase() == "@self") {
                    param.options.spaceKey = AJS.Meta.get('space-key');
                }
                input.attr("data-spacekey", param.options.spaceKey);
            }
            var type = param.options.type;
            if (typeof type == "string") {
                if(type == "page") {
                    input.addClass("autocomplete-page");
                    AJS.Confluence.Binder.autocompletePage(paramDiv);
                }
                else if (type == "blogpost") {
                    input.addClass("autocomplete-blogpost");
                    AJS.Confluence.Binder.autocompleteBlogpost(paramDiv);
                }
                else if (type == "attachment") {
                    input.addClass("autocomplete-attachment");
                    AJS.Confluence.Binder.autocompleteAttachment(paramDiv);
                }
            }
            else { // default to pages and blogs
                input.addClass("autocomplete-confluence-content");
                AJS.Confluence.Binder.autocompleteConfluenceContent(paramDiv);
            }
            return AJS.MacroBrowser.Field(paramDiv, input, options);
        },

        /**
         * Default field for all unknown types.
         */
        "string" : function (param, options) {
            var paramDiv = $(Confluence.Templates.MacroBrowser.macroParameter());
            var input = $("input", paramDiv);
            if (param.required) {
                input.keyup(AJS.MacroBrowser.processRequiredParameters);
            }
            return AJS.MacroBrowser.Field(paramDiv, input, options);
        },
        /**
         * A checkbox - assumes not true means false, not null.
         */
        "boolean" : function (param, options) {
            var paramDiv = $(Confluence.Templates.MacroBrowser.macroParameterBoolean());
            var input = $("input", paramDiv);
            options = options || {};
            options.setValue = options.setValue || function (value) {
                if (/true/i.test(value) ||
                    (/true/i.test(param.defaultValue) &amp;&amp; !(/false/i).test(value))) {
                    input.prop("checked", true);
                }
            };
            return AJS.MacroBrowser.Field(paramDiv, input, options);
        },
        "enum" : function (param, options) {
            if (param.multiple) {
                return AJS.MacroBrowser.ParameterFields["string"](param, options);
            }
            var paramDiv = $(Confluence.Templates.MacroBrowser.macroParameterSelect());
            var input = $("select", paramDiv);
            if (!(param.required || param.defaultValue)) {
                input.append(AJS.$("&lt;option/&gt;").attr("value", ""));
            }
            $(param.enumValues).each(function() {
                input.append(AJS.$("&lt;option/&gt;").attr("value", this).html("" + this));
            });
            return AJS.MacroBrowser.Field(paramDiv, input, options);
        },
        /**
         * Like a "string" field but hidden.
         */
        "_hidden" : function (param, options) {
            var paramDiv = $(Confluence.Templates.MacroBrowser.macroParameterHidden()).hide();
            var input = $("input", paramDiv);
            return AJS.MacroBrowser.Field(paramDiv, input, options);
        }

    };
})(AJS.$);