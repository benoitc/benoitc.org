function Editor() {
    var converter = new Showdown.converter;
    var converter_callback = function(value) {  
              $('#mdpreview').html(converter.makeHtml(value));  
    }

    
    $("#content").TextArea({
        change_callback: converter_callback 
    });

    var lastRoomleft = 0;
    var bottomEditHeight = $('#main-footer').offset().top - $('#content').offset().top -
            $("#content").height();
    
    $(window).resize(resizePanes);
    
    window.setInterval(resizePanes, 250);
    function resizePanes() {
        var roomLeft =  $(window).height() - $('#main-footer').height() 
         - $('#content').offset().top - bottomEditHeight;
        
        if (roomLeft < 0)
            roomLeft = 0;
        if (roomLeft == self.lastRoomLeft)
            return;

        lastRoomLeft = roomLeft;
        
        $('#content').height(roomLeft);
        $('#mdpreview').height(roomLeft);  
            
    }
}    
