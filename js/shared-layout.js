(function() {
	function loadSharedHeader() {
		var headers = document.querySelectorAll('[data-shared-header]');

		if (!headers.length) {
			return;
		}

		fetch('partials/header.html')
			.then(function(response) {
				if (!response.ok) {
					throw new Error('Unable to load the shared header.');
				}

				return response.text();
			})
			.then(function(html) {
				for (var i = 0; i < headers.length; i++) {
					headers[i].innerHTML = html;
				}
			})
			.catch(function(error) {
				if (window.console) {
					console.error(error);
				}
			});
	}

	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', loadSharedHeader);
	} else {
		loadSharedHeader();
	}
}());