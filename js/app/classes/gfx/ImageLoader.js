/*!
 * ImageLoader
 * Version: 1.0.0
 * Date: 2015/08/27
 * Source: https://gihub.com/jleelove/TileGame
 *
 * Copyright (c) 2015 Jamie Nichols
 * https://github.com/jleelove/
 * jamie337nichols
 * Jamie337nichols@gmail.com
 */
define(function(){
    var ImageLoader = {};

    ImageLoader.loadImage = function(_path){
        var image = new Image();
        image.load(_path);
        return image;
    };

    Image.prototype.load = function(url){
        var thisImg = this;
        var xmlHTTP = new XMLHttpRequest();
        xmlHTTP.open('GET', url,true);
        xmlHTTP.responseType = 'arraybuffer';
        xmlHTTP.onload = function(e) {
            var blob = new Blob([this.response]);
            thisImg.src = window.URL.createObjectURL(blob);
        };
        xmlHTTP.onprogress = function(e) {
            thisImg.completedPercentage = parseInt((e.loaded / e.total) * 100);
            console.log(thisImg.completedPercentage);
        };
        xmlHTTP.onloadstart = function() {
            thisImg.completedPercentage = 0;
        };
        xmlHTTP.send();
    };

    Image.prototype.completedPercentage = 0;

    return ImageLoader;
});