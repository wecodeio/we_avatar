# we_avatar

Choose an avatar image from your webcam or a file upload using HTML5 and jQuery

![](http://i.imgur.com/eAVDZwO.png) ![](http://i.imgur.com/7G7hvqt.png)

[View Demo](http://wecodeio.github.io/we_avatar/demo.html)

## Requirements

* jQuery
* [Twitter Bootstrap 3](http://getbootstrap.com/) (default styling)
* [Font-awesome](http://fortawesome.github.io/Font-Awesome/) (optional)

## Installation

### 1. Add we_avatar.js and we_avatar.css to your project.

### 2. Place this markup

    <div id="user_avatar" class="we_avatar centered_content" 
        data-mode="empty"
        data-image-url=""
        data-image-dataurl=""
        data-post-url=""
        data-delete-url=""
        style="width:160px; height:120px">
    </div>
    <div id="user_avatar_toolbar" class="we_avatar_toolbar"></div>

    <div id="client_avatar_msg" class="we_avatar_msg alert alert-info"></div>

### 3. Customize

* data-mode => "image" if there's already an image to show
* data-image-url => URL of the image to show
* data-image-dataurl => If you prefer, you can load the image in base64 here
* data-post-url => URL where the upload should be POSTed.
* data-delete-url => URL where a DELETE request will be made to delete the image.
* style => Size of the viewer/uploader

### 4. Fire it up

    <script type="text/javascript">
    jQuery(function(){
        we_start("user_avatar");
    })
    </script>

Note: Obviously you can change "user_avatar" to whatever you want.

### 5. Code the back-end side

```ruby
def upload_avatar
    @user = User.find(params[:id])
    if params[:dataurl]
        if @user.update_attribute( :avatar, params[:dataurl] )
            render text: "OK"
        else
            render text: "Error, try again"
        end
    end     
end
```     

---
## To-Do

* file upload -> RESIZED preview on canvas
* show post error/success
* CONFIG: button overlay texts & localized texts
* CONFIG: height and width (canvas & posted image)

