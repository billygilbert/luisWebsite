(function() {
	var sharedHeader = [
		'<div class="nametitle"><a href="index.html"><h1>Luis Alejandro Orozco</h1></a></div>',
		'<div class="subheadertitle"><h3>Baritone / Stage Director</h3></div>',
		'<div class="navsep1"></div>',
		'<div class="nav1"><nav><a href="about.html">About</a></nav></div>',
		'<div class="nav2"><nav><a href="music.html">Music</a></nav></div>',
		'<div class="nav3"><nav><a href="photos.html">Photos</a></nav></div>',
		'<div class="nav4"><nav><a href="videos.html">Videos</a></nav></div>',
		'<div class="nav5"><nav><a href="performances.html">Performances</a></nav></div>',
		'<div class="nav6"><nav><a href="directing.html">Stage Directing</a></nav></div>',
		'<div class="nav7"><nav><a href="contact.html">Contact</a></nav></div>',
		'<div class="navsep2"></div>'
	].join('');

	function loadSharedHeader() {
		var headers = document.querySelectorAll('[data-shared-header]');

		for (var i = 0; i < headers.length; i++) {
			headers[i].innerHTML = sharedHeader;
		}
	}

	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', loadSharedHeader);
	} else {
		loadSharedHeader();
	}
}());