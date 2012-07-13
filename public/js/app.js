var client = {

    ws: null,

    init: function() {
        console.log('> init');

        $('#submit').click(client.addComment);
        $('#comments').mouseover(function(){
            $(this).data('mouseover', true);
        });
        $('#comments').mouseout(function(){
            $(this).data('mouseover', false);
        });

        var host = window.document.location.host.replace(/:.*/, '');
        window.WebSocket = window.WebSocket || window.MozWebSocket;
        client.ws = new WebSocket('ws://' + host + ':8181');

        client.ws.onmessage = client.display;
    },

	success: function(text) {
		$('footer p').removeClass('error').text(text).show().fadeOut(1000);
		$('#comment').val('');
	},

	error: function(text) {
		$('footer p').addClass('error').text(text).show().fadeOut(1000);
	},

	addComment: function() {
		var comment = $.trim($('#comment').val());
		if(!comment.length){
			client.error('Please enter a comment');
			return false;
		}
        client.ws.send(comment);
		return false;
	},

	display: function(response) {
        var comments = JSON.parse(response.data);

		if(!comments) {
			return;
        }

		for(i in comments){
			var
				c = comments[i],
				ts = new Date(c.timestamp),
				t = {
					h: ts.getHours(),
					m: ts.getMinutes(),
					s: ts.getSeconds()
				};
			for(i in t){
				if(t[i] < 10)
					t[i] = '0' + t[i];
			}
			var
				time = t.h + ':' + t.m + ':' + t.s,
				li = '<li><span>' + time + '</span>' + '<p>' + c.content + '</p>'  + '</li>';
			$('#comments ol').append(li);
		}
		// scroll new comment into view if the mouse isn't over the comments list
		if(!$('#comments').data('mouseover'))
			$('#comments').scrollTop($('ol').height());	
		client.success(comments.length + ' comment(s) retrieved' );
	}
};

$(client.init);
