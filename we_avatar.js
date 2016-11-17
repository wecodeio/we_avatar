"use strict";

function we_start(dom_id){    
    var we_obj = $.extend( {}, we_avatar, { dom_id: dom_id } );    
    jQuery("#" + dom_id).data( "we-avatar", we_obj );
    we_obj.init();
}

var we_avatar = {
    dom_id: null,
    stream: null,
    avatar: null,
    toolbar: null,
    msg_container: null,    
    debug: false,
    messages: {},
    options: {},        
    init: function(){
        
        var self = this;
        
        this.avatar = jQuery("#" + self.dom_id);
        this.toolbar = jQuery("#" + self.dom_id + "_toolbar");        
        this.msg_container = jQuery("#" + self.dom_id + "_msg");
        this.inputfile = jQuery('<input type="file" id="' + self.dom_id + '_inputfile" class="we_avatar_inputfile" />');

        this.toolbar.after( this.inputfile );
        this.inputfile.on("change", function(){ we_callbacks.upload( self ) });

        this.options = {
            mode: self.avatar.data("mode"),
            image_url: self.avatar.data("image-url"),
            image_dataurl: self.avatar.data("image-dataurl"),
            post_url: self.avatar.data("post-url"),
            delete_url: self.avatar.data("delete-url"),
        }

        this.messages = {
            save_success: self.avatar.data("save-success-msg") ? self.avatar.data("save-success-msg") : "Image saved! / ¡Imagen guardada!",
            save_error: self.avatar.data("save-error-msg") ? self.avatar.data("save-error-msg") : "Something wrong happened! / ¡Ocurrió un error!",
            delete_confirm: self.avatar.data("delete-confirm") ? self.avatar.data("delete-confirm") : "Are you sure? / ¿Está seguro?",
            delete_success: self.avatar.data("delete-success-msg") ? self.avatar.data("delete-success-msg") : "Image deleted! / ¡Imagen eliminada!",
            delete_error: self.avatar.data("delete-error-msg") ? self.avatar.data("delete-error-msg") : "Something wrong happened! / ¡Ocurrió un error!",
        }
        this.update();    
    },
    update: function(){
        var self = this;
        
        self.avatar.attr( "data-mode", this.options.mode );
        
        var ht = '<div class="btn-group">';        
        switch ( this.options.mode ) {
            case 'image':
                if( this.options.image_dataurl !== "")
                {    this.avatar.css("background-image", "url(" + this.options.image_dataurl + ")"); }
                else
                {    this.avatar.css("background-image", "url(" + this.options.image_url + ")"); }
                this.avatar.html("");
                ht += '<button type="button" class="btn btn-default init-video"><i class="fa fa-camera"></i></a>';
                ht += '<button type="button" class="btn btn-default upload"><i class="fa fa-cloud-upload"></i></a>';
                ht += '<button type="button" class="btn btn-default delete"><i class="fa fa-trash"></i></a>';
                break;
            case 'empty':                
                this.avatar.html('<i class="fa fa-user fa-4x"></i>');
                this.avatar.css("background", "");
                this.avatar.css("background-color", "#eaeaea");
                ht += '<button type="button" class="btn btn-default init-video" ><i class="fa fa-camera"></i></a>';
                ht += '<button type="button" class="btn btn-default upload" ><i class="fa fa-cloud-upload"></i></a>';
                break;
            case 'video':
                ht += '<button type="button" class="btn btn-default take-picture" ><i class="fa fa-camera"></i></a>';
                ht += '<button type="button" class="btn btn-default cancel-video" ><i class="fa fa-remove"></i></a>';
                break;
            case 'review':
                ht += '<button type="button" class="btn btn-default save" ><i class="fa fa-check"></i></a>';
                ht += '<button type="button" class="btn btn-default cancel-review"><i class="fa fa-remove"></i></a>';
                break;
            case 'review_upload':
                ht += '<button type="button" class="btn btn-default save"><i class="fa fa-check"></i></a>';
                ht += '<button type="button" class="btn btn-default cancel-review-upload"><i class="fa fa-remove"></i></a>';
                break;
            }
        ht += '</div>';
        self.toolbar.html(ht);
        self.toolbar.find("button.init-video").on("click", function(){ we_handlers.init_video( self ) } );
        self.toolbar.find("button.upload").on("click", function(){ we_handlers.upload( self ) } )
        self.toolbar.find("button.delete").on("click", function(){ we_handlers.delete( self ) } )
        self.toolbar.find("button.take-picture").on("click", function(){ we_handlers.take_picture( self ) })
        self.toolbar.find("button.save").on("click", function(){ we_handlers.save( self ) })
        self.toolbar.find("button.cancel-video").on("click", function(){ we_handlers.cancel( self ) })
        self.toolbar.find("button.cancel-review").on("click", function(){ we_handlers.cancel( self, true ) } )
        self.toolbar.find("button.cancel-review-upload").on("click", function(){ we_handlers.cancel( self, false, true ) })
    }
}

var we_handlers = {
    init_video: function( obj ) {

        if( typeof obj == "undefined" ) return;
        
        obj.avatar.html("<video></video><canvas></canvas>");        
        obj.options.mode = "video";
        obj.update();
        var canvas = obj.avatar.find("canvas")[0];
        var video = obj.avatar.find("video")[0];        
        var width = parseInt( obj.avatar.css("width") );
        var streaming = false,
            height = 0;

        obj.msg_container.fadeOut();  

        navigator.getMedia = ( navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia);
        navigator.getMedia({ video: true, audio: false },
            function(stream) {                
                if (navigator.mozGetUserMedia) {
                    video.mozSrcObject = stream;
                } else {
                    var vendorURL = window.URL || window.webkitURL;
                    video.src = vendorURL.createObjectURL(stream);
                }
                obj.stream = stream.getTracks()[0]; //stream.stop() depricated;                
                video.play();
            },
            function(err) {
                obj.stream = undefined;
                if( obj.debug ){
                    console.log("An error occured! " + err);
                }
            }
        ),
        video.addEventListener('canplay', function(ev){
            if (!streaming) {
                height = video.videoHeight / (video.videoWidth/width);
                video.setAttribute('width', width);
                video.setAttribute('height', height);
                canvas.setAttribute('width', width);
                canvas.setAttribute('height', height);
                streaming = true;
            }
        }, false);
    },
    take_picture: function( obj ) {
        if( typeof obj == "undefined" ) return;

        var canvas = obj.avatar.find("canvas")[0];
        var video = obj.avatar.find("video")[0];                                
        obj.options.mode = "review";
        obj.update();
        jQuery(video).hide();
        canvas.width = parseInt(  obj.avatar.css("width") );
        canvas.height = parseInt( obj.avatar.css("height") );
        canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);
    }, 
    cancel: function(obj, return_to_video, return_from_upload_review ) {

        if( typeof obj == "undefined" ) return;

        return_to_video = typeof return_to_video !== 'undefined' ? return_to_video : false;
        return_from_upload_review = typeof return_from_upload_review !== 'undefined' ? return_from_upload_review : false;
        
        var canvas = obj.avatar.find("canvas")[0];
        var video = obj.avatar.find("video")[0];  

        if(return_to_video==true)
        {
            canvas.width = canvas.width;
            jQuery(video).show();
            obj.options.mode = "video";
        }
        else
        {   if(return_from_upload_review==true)
            {
                obj.options.image_dataurl_review = "";
                if( obj.options.image_url == "" && obj.options.image_dataurl == "" )
                {    obj.options.mode = "empty"; }
                else
                {    obj.options.mode = "image"; }
            }
            else
            {                      
                if( obj.stream )
                    obj.stream.stop();
                if( obj.options.image_url == "" && obj.options.image_dataurl == "" )
                {    obj.options.mode = "empty"; }
                else
                {    obj.options.mode = "image"; }
            }
        }
        obj.update();
    },
    save: function( obj ){
        
        if( typeof obj == "undefined" ) return;

        var canvas = obj.avatar.find("canvas")[0];
        var canvas2 = document.createElement( "canvas" );
        canvas2.width = canvas.videoWidth || canvas.width;
        canvas2.height = canvas.videoHeight || canvas.height;
        canvas2.getContext( "2d" ).drawImage( canvas, 0, 0 );
        var dataURL = canvas2.toDataURL();

        obj.msg_container.fadeOut();

        jQuery.post( obj.options.post_url, { dataurl: dataURL })
        .done(function(data){
            if( data=="OK"){
                //show some success                
                if( obj.msg_container )
                    obj.msg_container.html( obj.messages.save_success ).fadeIn();
            }
            else{
                if( obj.msg_container )
                    obj.msg_container.html( data ).fadeIn();
                else
                    alert(data);
            }
        }).fail(function(){
            alert( obj.messages.save_error );
        });

        obj.options.image_dataurl = dataURL;        
        obj.options.mode = "image" ;        
        try{ obj.stream.stop() }catch(e){};
        obj.update();
    },
    delete: function( obj ){
        if( typeof obj == "undefined" ) return;
        
        var canvas = obj.avatar.find("canvas")[0];   
        obj.msg_container.fadeOut();        
        if( confirm( obj.messages.delete_confirm ) ){
            jQuery.ajax({
                url: obj.options.delete_url,
                type: 'DELETE', 
                dataType: 'text',
                success: function(data){
                    obj.options.image_url = "";
                    obj.options.image_dataurl = "";
                    obj.options.mode = "empty";
                    obj.update();
                    if( obj.msg_container.length )
                        obj.msg_container.html( obj.messages.delete_success ).fadeIn();
                }, 
                error: function(){
                    if( obj.msg_container )
                        obj.msg_container.html( obj.messages.delete_error ).fadeIn();
                    else
                        alert( obj.messages.delete_error );                    
                }
            });
        }
            
    },
    upload: function( obj ){        
        if( typeof obj == "undefined" ) return;
        obj.inputfile.click();
    }
}

var we_callbacks = {
    upload: function( obj ){
        if( typeof obj == "undefined" ) return;
        
        obj.msg_container.fadeOut();  

        if( obj.inputfile[0].files.length < 1 )
            return;
        var file = obj.inputfile[0].files[0];
        var oFReader = new FileReader(), rFilter = /^image\/(?:bmp|cis\-cod|gif|ief|jpeg|pipeg|png|svg\+xml|tiff|x\-cmu\-raster|x\-cmx|x\-icon|x\-portable\-anymap|x\-portable\-bitmap|x\-portable\-graymap|x\-portable\-pixmap|x\-rgb|x\-xbitmap|x\-xpixmap|x\-xwindowdump)$/i;
        if (!rFilter.test(file.type)) { alert("You must upload an image! / ¡Sólo se puede subir una imagen!"); return; }
        oFReader.onload = function (oFREvent) {
            obj.avatar.html("<canvas></canvas>");
            var canvas = obj.avatar.find("canvas")[0];
            jQuery(canvas).css("background-color", "#eaeaea");            
            obj.options.image_dataurl_review = oFREvent.target.result;
            obj.options.mode = "review_upload";            
            obj.update();
            canvas.width = parseInt( obj.avatar.css("width") );
            canvas.height = parseInt( obj.avatar.css("height") );
            var image = new Image();
            image.src = oFREvent.target.result;
            image.onload = function() {
                canvas.getContext('2d').drawImage(image, 0, 0);
            };
        };
        oFReader.readAsDataURL(file);
    }
}







// TBD: file upload -> RESIZED preview on canvas
// TBD: CONFIG: button overlay texts & localized texts
// TBD: CONFIG: height and width (canvas & posted image)
