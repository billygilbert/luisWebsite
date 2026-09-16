(function() {
	var sharedHeader = [
		'<div class="nametitle"><a href="index.html"><h1>Luis Alejandro Orozco</h1></a></div>',
		'<div class="subheadertitle"><h3>Baritone / Stage Director</h3></div>',
		'<button type="button" class="nav-toggle" aria-label="Open menu" aria-expanded="false">Menu</button>',
		'<div class="navsep1"></div>',
		'<nav class="site-nav" id="site-nav">',
		'<div class="nav1"><a href="about.html">About</a></div>',
		'<div class="nav2"><a href="music.html">Music</a></div>',
		'<div class="nav3"><a href="photos.html">Photos</a></div>',
		'<div class="nav4"><a href="videos.html">Videos</a></div>',
		'<div class="nav5"><a href="performances.html">Performances</a></div>',
		'<div class="nav6"><a href="directing.html">Stage Directing</a></div>',
		'<div class="nav7"><a href="contact.html">Contact</a></div>',
		'</nav>',
		'<div class="navsep2"></div>'
	].join('');

	function ensureViewport() {
		if (document.querySelector('meta[name="viewport"]')) {
			return;
		}
		var meta = document.createElement('meta');
		meta.name = 'viewport';
		meta.content = 'width=device-width, initial-scale=1, viewport-fit=cover';
		document.head.appendChild(meta);
	}

	function ensureMobileCss() {
		if (document.querySelector('link[href$="css/mobile.css"]')) {
			return;
		}
		var link = document.createElement('link');
		link.rel = 'stylesheet';
		link.type = 'text/css';
		link.href = 'css/mobile.css';
		document.head.appendChild(link);
	}

	function bindNavToggle() {
		var headers = document.querySelectorAll('.header');
		for (var i = 0; i < headers.length; i++) {
			(function(header) {
				var button = header.querySelector('.nav-toggle');
				if (!button) {
					return;
				}
				button.onclick = function() {
					var open = header.className.indexOf('is-nav-open') !== -1;
					if (open) {
						header.className = header.className.replace(/\s*is-nav-open/g, '');
						button.setAttribute('aria-expanded', 'false');
						button.innerHTML = 'Menu';
					} else {
						header.className += ' is-nav-open';
						button.setAttribute('aria-expanded', 'true');
						button.innerHTML = 'Close';
					}
				};
			}(headers[i]));
		}
	}

	function loadSharedHeader() {
		ensureViewport();
		ensureMobileCss();
		var headers = document.querySelectorAll('[data-shared-header]');
		for (var i = 0; i < headers.length; i++) {
			headers[i].innerHTML = sharedHeader;
		}
		bindNavToggle();
	}

	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', loadSharedHeader);
	} else {
		loadSharedHeader();
	}
}());
