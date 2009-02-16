function Editor() {
    var converter = new Showdown.converter;
    var converter_callback = function(value) {  
              $('#mdpreview')[0].innerHTML = converter.makeHtml(value);  
    }

    
    $("#body").TextArea({
        change_callback: converter_callback 
    });

    var lastRoomleft = 0;
    var lastPRoomLef = 0;
    var bottomEditHeight = $('#main-footer').offset().top - $('#body').offset().top -
            $("#body").height();
    
    $(window).resize(resizePanes);
    
    window.setInterval(resizePanes, 250);
    function resizePanes() {
        var roomLeft =  $(window).height() - $('#main-footer').height() 
         - $('#body').offset().top - bottomEditHeight;
        var proomLeft = $(window).height()
        
        if (roomLeft < 0)
            roomLeft = 0;
        if (roomLeft == self.lastRoomLeft)
            return;

        lastRoomLeft = roomLeft;
        
        $('#body').height(roomLeft);
        $('#mdpreview').height(roomLeft);  
            
    }
}    
