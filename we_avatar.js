
var we_stream;

function we_start(dom_id){
    var avatar = jQuery("#" + dom_id),
        toolbar = jQuery("#" + dom_id + "_toolbar");
    toolbar.after('<input type="file" id="' + dom_id + '_inputfile" class="we_avatar_inputfile" />');
    jQuery("#" + dom_id + "_inputfile").on("change", function(){ we_upload_callback(dom_id) });
    we_update(dom_id);
}

function we_update(dom_id) {
    var avatar = jQuery("#" + dom_id),
        toolbar = jQuery("#" + dom_id + "_toolbar"),
        ht = '<div class="btn-group">';
    switch (avatar.attr("data-mode")) {
    case 'image':
        if(avatar.attr("data-image-dataurl") !== "")
        {    avatar.css("background-image", "url(" + avatar.attr("data-image-dataurl") + ")"); }
        else
        {    avatar.css("background-image", "url(" + avatar.attr("data-image-url") + ")"); }
        avatar.html("");
        ht += '<button type="button" class="btn btn-default" onclick="we_init_video(\'' + dom_id + '\');"><i class="fa fa-camera"></i></a>';
        ht += '<button type="button" class="btn btn-default" onclick="we_upload(\'' + dom_id + '\');"><i class="fa fa-cloud-upload"></i></a>';
        ht += '<button type="button" class="btn btn-default" onclick="we_delete(\'' + dom_id + '\');"><i class="fa fa-trash"></i></a>';
        break;
    case 'empty':
        avatar.html('<i class="fa fa-user fa-4x"></i>');
        avatar.css("background-image", "");
        ht += '<button type="button" class="btn btn-default" onclick="we_init_video(\'' + dom_id + '\');"><i class="fa fa-camera"></i></a>';
        ht += '<button type="button" class="btn btn-default" onclick="we_upload(\'' + dom_id + '\');"><i class="fa fa-cloud-upload"></i></a>';
        break;
    case 'video':
        ht += '<button type="button" class="btn btn-default" onclick="we_take_picture(\'' + dom_id + '\')"><i class="fa fa-camera"></i></a>';
        ht += '<button type="button" class="btn btn-default" onclick="we_cancel(\'' + dom_id + '\')"><i class="fa fa-remove"></i></a>';
        break;
    case 'review':
        ht += '<button type="button" class="btn btn-default" onclick="we_save(\'' + dom_id + '\')"><i class="fa fa-check"></i></a>';
        ht += '<button type="button" class="btn btn-default" onclick="we_cancel(\'' + dom_id + '\', true)"><i class="fa fa-remove"></i></a>';
        break;
    case 'review_upload':
        ht += '<button type="button" class="btn btn-default" onclick="we_save(\'' + dom_id + '\')"><i class="fa fa-check"></i></a>';
        ht += '<button type="button" class="btn btn-default" onclick="we_cancel(\'' + dom_id + '\', false, true)"><i class="fa fa-remove"></i></a>';
        break;
    }
    ht += '</div>';
    toolbar.html(ht);
}

function we_init_video(dom_id) {
    var avatar = jQuery("#" + dom_id);
    avatar.html("<video></video><canvas></canvas>");
    avatar.attr("data-mode", "video");
    we_update(dom_id);
    var canvas = jQuery("#" + dom_id + " canvas")[0];
    var video = jQuery("#" + dom_id + " video")[0];
    var msg_container = jQuery("#" + dom_id + "_msg");
    var width = parseInt(avatar.css("width"));
    var streaming = false,
      height = 0;

    if( msg_container.length )
        msg_container.fadeOut();  

    navigator.getMedia = ( navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia);
    navigator.getMedia({ video: true, audio: false },
        function(stream) {
            if (navigator.mozGetUserMedia) {
                video.mozSrcObject = stream;
            } else {
                var vendorURL = window.URL || window.webkitURL;
                video.src = vendorURL.createObjectURL(stream);
            }
            we_stream = stream;
            video.play();
        },
        function(err) {
            we_stream = undefined;
            console.log("An error occured! " + err);
        }
    );
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
}

function we_take_picture(dom_id) {
    var canvas = jQuery("#" + dom_id + " canvas")[0];
    var avatar = jQuery("#" + dom_id);
    var video = jQuery("#" + dom_id + " video")[0];
    avatar.attr("data-mode", "review");
    we_update(dom_id);
    jQuery(video).hide();
    canvas.width = parseInt(jQuery("#" + dom_id).css("width"));
    canvas.height = parseInt(jQuery("#" + dom_id).css("height"));
    canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);
}

function we_cancel(dom_id, return_to_video, return_from_upload_review) {
    return_to_video = typeof return_to_video !== 'undefined' ? return_to_video : false;
    return_from_upload_review = typeof return_from_upload_review !== 'undefined' ? return_from_upload_review : false;
    var avatar = jQuery("#" + dom_id);
    var video = jQuery("#" + dom_id + " video")[0];
    var canvas = jQuery("#" + dom_id + " canvas")[0];

    if(return_to_video==true)
    {
        canvas.width = canvas.width;
        jQuery(video).show();
        avatar.attr("data-mode", "video");
    }
    else
    {   if(return_from_upload_review==true)
        {
            avatar.attr("dataurl-review", "");
            if(avatar.attr("data-image-url")=="" && avatar.attr("data-image-dataurl")=="")
            {    avatar.attr("data-mode", "empty"); }
            else
            {    avatar.attr("data-mode", "image"); }
        }
        else
        {
            we_stream.stop();
            if(avatar.attr("data-image-url")=="" && avatar.attr("data-image-dataurl")=="")
            {    avatar.attr("data-mode", "empty"); }
            else
            {    avatar.attr("data-mode", "image"); }
        }
    }
    we_update(dom_id);
}

function we_save(dom_id)
{
    var avatar = jQuery("#" + dom_id);
    var canvas = jQuery("#" + dom_id + " canvas")[0];
    var canvas2 = document.createElement( "canvas" );
    var msg_container = jQuery("#" + dom_id + "_msg");
    canvas2.width = canvas.videoWidth || canvas.width;
    canvas2.height = canvas.videoHeight || canvas.height;
    canvas2.getContext( "2d" ).drawImage( canvas, 0, 0 );
    var dataURL = canvas2.toDataURL();

    if( msg_container.length )
        msg_container.fadeOut();

    jQuery.post( avatar.attr("data-post-url") , { dataurl: dataURL })
    .done(function(data){
        if( data=="OK"){
            //show some success
            if( msg_container.length )
                msg_container.html( '<i class="fa fa-check"></i>' + " Imagen guardada con éxito" ).fadeIn();
        }
        else{
            if( msg_container.length )
                msg_container.html( data ).fadeIn();
            else
                alert(data);
        }
    }).fail(function(){
        alert("Something wrong happened! / ¡Ocurrió un error!");
    });
    avatar.attr("data-image-dataurl", dataURL);
    avatar.attr("data-mode", "image");
    try{ we_stream.stop() }catch(e){};
    we_update(dom_id);
}

function we_delete(dom_id)
{
    var avatar = jQuery("#" + dom_id);
    var canvas = jQuery("#" + dom_id + " canvas")[0];
    var msg_container = jQuery("#" + dom_id + "_msg");

    if( msg_container.length )
        msg_container.fadeOut();

    if(confirm('Are you sure? / ¿Está seguro?'))
        jQuery.ajax({
            url: avatar.attr("data-delete-url"),
            type: 'DELETE', 
            dataType: 'text',
            success: function(data){
                avatar.attr("data-image-url", "");
                avatar.attr("data-image-dataurl", "");
                avatar.attr("data-mode", "empty")
                we_update(dom_id);
                if( msg_container.length )
                    msg_container.html( '<i class="fa fa-check"></i>' + " Imagen eliminada con éxito" ).fadeIn();
            }, 
            error: function(){
                alert("Something wrong happened! / ¡Ocurrió un error!");
            }
        });
}

function we_upload(dom_id)
{
    var inputfile = jQuery("#" + dom_id + "_inputfile");
    inputfile.click();
}
function we_upload_callback(dom_id)
{
    var avatar = jQuery("#" + dom_id),
        inputfile = jQuery("#" + dom_id + "_inputfile"),
        msg_container = jQuery("#" + dom_id + "_msg");

    if( msg_container.length )
        msg_container.fadeOut();  

    if(inputfile[0].files.length < 1)
        return;
    var file = inputfile[0].files[0];
    var oFReader = new FileReader(), rFilter = /^image\/(?:bmp|cis\-cod|gif|ief|jpeg|pipeg|png|svg\+xml|tiff|x\-cmu\-raster|x\-cmx|x\-icon|x\-portable\-anymap|x\-portable\-bitmap|x\-portable\-graymap|x\-portable\-pixmap|x\-rgb|x\-xbitmap|x\-xpixmap|x\-xwindowdump)$/i;
    if (!rFilter.test(file.type)) { alert("You must upload an image! / ¡Sólo se puede subir una imagen!"); return; }
    oFReader.onload = function (oFREvent) {
        avatar.html("<canvas></canvas>");
        var canvas = jQuery("#" + dom_id + " canvas")[0];
        jQuery(canvas).css("background-color", "#eaeaea");
        avatar.attr("data-image-dataurl-review", oFREvent.target.result);
        avatar.attr("data-mode", "review_upload");
        we_update(dom_id);
        canvas.width = parseInt(jQuery("#" + dom_id).css("width"));
        canvas.height = parseInt(jQuery("#" + dom_id).css("height"));
        var image = new Image();
        image.src = oFREvent.target.result;
        image.onload = function() {
            canvas.getContext('2d').drawImage(image, 0, 0);
        };
    };
    oFReader.readAsDataURL(file);
}

// TBD: file upload -> RESIZED preview on canvas

// TBD: show post error/success
// TBD: CONFIG: button overlay texts & localized texts
// TBD: CONFIG: height and width (canvas & posted image)
